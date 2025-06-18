from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

import os
from dotenv import load_dotenv
from flask import render_template

load_dotenv()
# Validación de variables de entorno
FLASK_HOST = os.getenv('FLASK_HOST')
FLASK_PORT = os.getenv('FLASK_PORT')
UPLOAD_FOLDER = 'uploads/dataset'
ALLOWED_EXTENSIONS = {'xls', 'xlsx'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if not FLASK_HOST or not FLASK_PORT:
    raise EnvironmentError("Faltan variables de entorno FLASK_HOST o FLASK_PORT.")

try:
    FLASK_PORT = int(FLASK_PORT)
except ValueError:
    raise ValueError("FLASK_PORT debe ser un número entero.")

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

# Archivos
FILE_PATH_INFLACION = 'uploads/dataset/inflacion_bolivia.xls'
FILE_PATH_POBLACION = 'uploads/dataset/censo_poblacion.xlsx'
# Verificar que los archivos existen
for path in [FILE_PATH_INFLACION, FILE_PATH_POBLACION, 'uploads/dataset/censo_pobreza.xlsx']:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Archivo no encontrado: {path}")

# ========================================
# API: Inflación
# ========================================
@app.route('/api/inflacion', methods=['GET'])
def get_inflation():
    anio_param = request.args.get('anio')
    try:
        selected_year = int(anio_param) if anio_param else 1980
    except ValueError:
        selected_year = 1980

    # Leer archivo y procesar
    df = pd.read_excel(FILE_PATH_INFLACION, sheet_name=0, header=3)
    df = df.dropna(how='all', axis=0)
    bolivia_data = df[df['Country Code'] == 'BOL'].copy()

    years = [int(col) for col in bolivia_data.columns if col.isdigit()]
    inflation_data = bolivia_data[[str(y) for y in years]].iloc[0].dropna().astype(float)
    inflation_df = pd.DataFrame({
        'Year': inflation_data.index.astype(int),
        'Inflation': inflation_data.values
    })

    # Verificar si hay suficientes años hacia adelante
    max_year = inflation_df['Year'].max()
    min_year = inflation_df['Year'].min()

    if selected_year + 9 <= max_year:
        start_year = selected_year
        end_year = selected_year + 9
    else:
        end_year = selected_year
        start_year = max(selected_year - 9, min_year)

    filtered = inflation_df[
        (inflation_df['Year'] >= start_year) &
        (inflation_df['Year'] <= end_year)
    ]

    return jsonify(filtered.to_dict(orient='records'))

@app.route('/api/anios', methods=['GET'])
def get_years():
    df = pd.read_excel(FILE_PATH_INFLACION, sheet_name=0, header=3)
    df = df.dropna(how='all', axis=0)
    bolivia_data = df[df['Country Code'] == 'BOL'].copy()
    years = [int(col) for col in bolivia_data.columns if col.isdigit()]
    return jsonify(years)

# ========================================
# API: Indicadores disponibles de población
# ========================================
@app.route('/api/indicadores_poblacion', methods=['GET'])
def get_indicadores_poblacion():
    df = pd.read_excel(FILE_PATH_POBLACION, header=2)
    df.columns = df.columns.astype(str).str.strip().str.replace('\n', ' ').str.replace('\r', '', regex=False)
    df = df.loc[:, ~df.columns.str.contains("^Unnamed", na=False)]
    indicadores = [col for col in df.columns if col not in ['DEPARTAMENTO Y MUNICIPIO', 'NIVEL']]
    return jsonify(indicadores)

# ========================================
# API: Datos de población por municipio
# ========================================
@app.route('/api/poblacion', methods=['GET'])
def get_poblacion():
    departamento = request.args.get('departamento')
    indicador = request.args.get('indicador')

    if not departamento or not indicador:
        return jsonify({'error': 'Parámetros requeridos: departamento e indicador'}), 400

    df = pd.read_excel(FILE_PATH_POBLACION, header=2)
    df.columns = df.columns.astype(str).str.strip().str.replace('\n', ' ').str.replace('\r', '', regex=False)
    df = df.loc[:, ~df.columns.str.contains("^Unnamed", na=False)]
    df = df[df['DEPARTAMENTO Y MUNICIPIO'].notna()]
    df = df[df['DEPARTAMENTO Y MUNICIPIO'].str.strip().ne("")]
    df['NIVEL'] = df['DEPARTAMENTO Y MUNICIPIO'].apply(
        lambda x: 'DEP' if df['DEPARTAMENTO Y MUNICIPIO'].str.match(f"^{x}$").sum() == 1 and x.isupper() else 'MUN'
    )

    try:
        start = df.index[df['DEPARTAMENTO Y MUNICIPIO'] == departamento][0]
    except IndexError:
        return jsonify({'error': 'Departamento no encontrado'}), 404

    municipios = []
    for i in range(start + 1, len(df)):
        if df.iloc[i]['NIVEL'] == 'DEP':
            break
        municipios.append(df.iloc[i])

    municipios_df = pd.DataFrame(municipios)

    indicador_h = next((col for col in df.columns if indicador in col and 'Hombre' in col), None)
    indicador_m = next((col for col in df.columns if indicador in col and 'Mujer' in col), None)

    if indicador_h and indicador_m:
        municipios_df = municipios_df[['DEPARTAMENTO Y MUNICIPIO', indicador_h, indicador_m]].dropna()
        data = {
            'labels': municipios_df['DEPARTAMENTO Y MUNICIPIO'].tolist(),
            'hombres': municipios_df[indicador_h].tolist(),
            'mujeres': municipios_df[indicador_m].tolist(),
            'tipo': 'comparativo'
        }
    else:
        if indicador not in municipios_df.columns:
            return jsonify({'error': 'Indicador no disponible'}), 400
        municipios_df = municipios_df[['DEPARTAMENTO Y MUNICIPIO', indicador]].dropna()
        data = {
            'labels': municipios_df['DEPARTAMENTO Y MUNICIPIO'].tolist(),
            'valores': municipios_df[indicador].tolist(),
            'tipo': 'simple'
        }

    return jsonify(data)
# ===========================
# API: Indicadores de Pobreza
# ===========================
@app.route('/api/indicadores_pobreza', methods=['GET'])
def get_indicadores_pobreza():
    df = pd.read_excel('uploads/dataset/censo_pobreza.xlsx', header=2)
    df.columns = df.columns.astype(str).str.strip().str.replace('\n', ' ').str.replace('\r', '', regex=False)
    df = df.loc[:, ~df.columns.str.contains("^Unnamed", na=False)]
    indicadores = [col for col in df.columns if col not in ['DEPARTAMENTO Y MUNICIPIO', 'NIVEL']]
    return jsonify(indicadores)

# ===========================
# API: Datos de Pobreza
# ===========================
@app.route('/api/pobreza', methods=['GET'])
def get_pobreza():
    departamento = request.args.get('departamento')
    indicador = request.args.get('indicador')

    df = pd.read_excel('uploads/dataset/censo_pobreza.xlsx', header=2)
    df.columns = df.columns.astype(str).str.strip().str.replace('\n', ' ').str.replace('\r', '', regex=False)
    df = df.loc[:, ~df.columns.str.contains("^Unnamed", na=False)]
    df = df[df['DEPARTAMENTO Y MUNICIPIO'].notna()]
    df = df[df['DEPARTAMENTO Y MUNICIPIO'].str.strip().ne("")]
    df['NIVEL'] = df['DEPARTAMENTO Y MUNICIPIO'].apply(
        lambda x: 'DEP' if df['DEPARTAMENTO Y MUNICIPIO'].str.match(f"^{x}$").sum() == 1 and x.isupper() else 'MUN'
    )

    try:
        start = df.index[df['DEPARTAMENTO Y MUNICIPIO'] == departamento][0]
    except IndexError:
        return jsonify({'error': 'Departamento no encontrado'}), 404

    municipios = []
    for i in range(start + 1, len(df)):
        if df.iloc[i]['NIVEL'] == 'DEP':
            break
        municipios.append(df.iloc[i])

    municipios_df = pd.DataFrame(municipios)

    # Conversión numérica
    for col in municipios_df.columns:
        if col not in ['DEPARTAMENTO Y MUNICIPIO', 'NIVEL']:
            municipios_df[col] = pd.to_numeric(municipios_df[col], errors='coerce')

    indicador_h = next((col for col in df.columns if indicador in col and 'Hombre' in col), None)
    indicador_m = next((col for col in df.columns if indicador in col and 'Mujer' in col), None)

    if indicador_h and indicador_m:
        municipios_df = municipios_df[['DEPARTAMENTO Y MUNICIPIO', indicador_h, indicador_m]].dropna()
        return jsonify({
            'labels': municipios_df['DEPARTAMENTO Y MUNICIPIO'].tolist(),
            'hombres': municipios_df[indicador_h].tolist(),
            'mujeres': municipios_df[indicador_m].tolist(),
            'tipo': 'comparativo'
        })
    elif indicador in municipios_df.columns:
        municipios_df = municipios_df[['DEPARTAMENTO Y MUNICIPIO', indicador]].dropna()
        return jsonify({
            'labels': municipios_df['DEPARTAMENTO Y MUNICIPIO'].tolist(),
            'valores': municipios_df[indicador].tolist(),
            'tipo': 'simple'
        })
    else:
        return jsonify({'error': 'Indicador no disponible'}), 400
# ===========================
# API: Previsualizar dataset
# ===========================
@app.route('/api/previsualizar-dataset', methods=['POST'])
def previsualizar_dataset():
    archivo = request.files.get('archivo')
    tipo = request.form.get('tipo')

    if not archivo or not tipo:
        return jsonify({'error': 'Faltan el archivo o el tipo de dataset'}), 400

    # Validar el tipo
    tipo = tipo.lower()
    estructuras_esperadas = {
        'inflacion': ['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code'],
        'poblacion': ['DEPARTAMENTO Y MUNICIPIO', 'POBLACIÓN EMPADRONADA 2001', 'POBLACIÓN EMPADRONADA 2012'],
        'pobreza': ['DEPARTAMENTO Y MUNICIPIO', 'POBLACIÓN TOTAL (Objeto de estudio)1', 'Porcentaje de Población Pobre']
    }

    columnas_requeridas = estructuras_esperadas.get(tipo)
    if not columnas_requeridas:
        return jsonify({'error': 'Tipo de dataset no reconocido'}), 400

    try:
        df = pd.read_excel(archivo, header=2 if tipo != 'inflacion' else 3)

        df.columns = df.columns.astype(str).str.strip().str.replace('\n', ' ').str.replace('\r', '', regex=False)
        columnas = df.columns.tolist()

        # Validar que existan todas las columnas requeridas
        for col in columnas_requeridas:
            if not any(col.lower() in c.lower() for c in columnas):
                return jsonify({'error': f'El archivo no contiene la columna esperada: "{col}"'}), 400

        filas = df.head(5).astype(str).replace('nan', '').values.tolist()

        return jsonify({'columnas': columnas, 'filas': filas})
    except Exception as e:
        print(f'❌ Error al previsualizar dataset: {e}')
        return jsonify({'error': f'Error al procesar el archivo: {str(e)}'}), 500
# ===========================
# API: subir dataset
# ===========================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/subir-dataset', methods=['POST'])
def subir_dataset():
    if 'archivo' not in request.files or 'tipo' not in request.form:
        return jsonify({'error': 'Archivo o tipo faltante'}), 400

    archivo = request.files['archivo']
    tipo = request.form.get('tipo')

    if archivo.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    if archivo and allowed_file(archivo.filename):
        filename_map = {
            'inflacion': 'inflacion_bolivia.xls',
            'poblacion': 'censo_poblacion.xlsx',
            'pobreza': 'censo_pobreza.xlsx'
        }

        if tipo not in filename_map:
            return jsonify({'error': 'Tipo de dataset inválido'}), 400

        ruta = os.path.join(app.config['UPLOAD_FOLDER'], filename_map[tipo])
        archivo.save(ruta)
        return jsonify({'mensaje': 'Archivo subido correctamente'}), 200

    return jsonify({'error': 'Formato de archivo no permitido'}), 400


# ========================================
# Correr servidor
# ========================================
if __name__ == '__main__':
    app.run(debug=True, host=FLASK_HOST, port=FLASK_PORT)


