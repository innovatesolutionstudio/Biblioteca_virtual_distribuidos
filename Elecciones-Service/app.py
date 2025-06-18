from flask import Flask, render_template
import pandas as pd
import matplotlib.pyplot as plt
import os
import matplotlib
matplotlib.use('Agg')  # 🛡️ fuerza backend no-GUI
import seaborn as sns
from sklearn.linear_model import LogisticRegression
import numpy as np

app = Flask(__name__)

@app.route('/')
def grafico_votos():
    df = pd.read_csv('data/elecciones_departamentos_2020.csv', sep=';')
    df.columns = df.columns.str.strip()

    # Lista de columnas de partidos (ajustar si cambia el orden)
    partidos = ['CREEMOS', 'ADN', 'MAS IPSP', 'FPV', 'PAN BOL', 'LIBRE 21', 'CC', 'JUNTOS']

    # Convertir columnas a números (eliminar puntos)
    for col in partidos:
        df[col] = df[col].astype(str).str.replace('.', '', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Total de votos por partido
    votos = df[partidos].sum().sort_values(ascending=False)

    # Guardar gráfico
    plt.figure(figsize=(10, 6))
    votos.plot(kind='bar', color='orange')
    plt.title('Total de votos por partido - Elecciones 2020')
    plt.ylabel('Votos')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.grid(axis='y')
    os.makedirs('static', exist_ok=True)
    plt.savefig('static/votos_partido.png')
    plt.close()

    # Convertir a lista de tuplas para la tabla HTML
    votos_lista = [(partido, int(votos[partido])) for partido in votos.index]

    return render_template('grafico.html', votos_partido=votos_lista)

@app.route('/informe')
def informe_electoral():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.decomposition import PCA
    import os
    from flask import request

    # Leer el partido seleccionado desde GET
    partido_seleccionado = request.args.get('partido', 'MAS IPSP')

    # Cargar datos
    df = pd.read_csv('data/elecciones_provincias_2020.csv', sep=';')
    df.columns = df.columns.str.strip()
    df['Provincia'] = df.iloc[:, 0].str.strip()
    df = df.dropna(subset=['Provincia'])

    partidos = ['CREEMOS', 'MAS IPSP', 'FPV', 'CC']
    for col in partidos + ['VOTO VALIDO']:
        df[col] = df[col].astype(str).str.replace('.', '', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    df = df[df['VOTO VALIDO'] > 0]

    # Calcular % por partido
    for col in partidos:
        df[f'% {col}'] = df[col] / df['VOTO VALIDO']

    # 🎯 Variable objetivo: 1 si partido seleccionado tiene más votos que todos los demás
    def gano_partido(row):
        return int(row[partido_seleccionado] == max([row[p] for p in partidos]))

    df['gana_partido'] = df.apply(gano_partido, axis=1)

    # 📈 Variables predictoras: % de votos de los otros partidos
    predictoras = [f'% {p}' for p in partidos if p != partido_seleccionado]
    X = df[predictoras]
    y = df['gana_partido']

    # 🔄 PCA para reducir a 1D y graficar sigmoide
    pca = PCA(n_components=1)
    X_1D = pca.fit_transform(X)

    modelo = LogisticRegression()

    # Validar que haya al menos dos clases
    if len(np.unique(y)) < 2:
        # Graficar mensaje vacío
        plt.figure(figsize=(8, 5))
        plt.text(0.5, 0.5, f"No hay suficientes datos para generar regresión\n({partido_seleccionado} nunca gana o siempre gana)", 
                ha='center', va='center', fontsize=12)
        plt.axis('off')
        os.makedirs('static', exist_ok=True)
        plt.savefig('static/logistica_partido.png')
        plt.close()
    else:
        modelo.fit(X_1D, y)
        x_vals = np.linspace(X_1D.min(), X_1D.max(), 100).reshape(-1, 1)
        probs = modelo.predict_proba(x_vals)[:, 1]

        # Graficar normalmente
        plt.figure(figsize=(8, 6))
        plt.scatter(X_1D, y, color='blue', label='Datos reales')
        plt.plot(x_vals, probs, color='red', linewidth=2, label='Regresión logística')
        plt.xlabel('Componente PCA de % votos otros partidos')
        plt.ylabel(f'Probabilidad de que gane {partido_seleccionado}')
        plt.title(f'Regresión logística para {partido_seleccionado} (por provincia)')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        os.makedirs('static', exist_ok=True)
        plt.savefig('static/logistica_partido.png')
        plt.close()


    # 📝 Informe detallado por partido
    departamento_df = pd.read_csv('data/elecciones_departamentos_2020.csv', sep=';')
    departamento_df.columns = departamento_df.columns.str.strip()
    departamento_df['Departamento'] = departamento_df.iloc[:, 0].str.strip()
    departamento_df = departamento_df.dropna(subset=['Departamento'])

    # Limpieza
    columnas_voto = ['CREEMOS', 'MAS IPSP', 'FPV', 'CC', 'VOTO VALIDO', 'VOTO BLANCO', 'VOTO NULO', 'VOTO EMITIDO', 'HABILITADOS']
    for col in columnas_voto:
        if col in departamento_df.columns:
            departamento_df[col] = departamento_df[col].astype(str).str.replace('.', '', regex=False)
            departamento_df[col] = pd.to_numeric(departamento_df[col], errors='coerce').fillna(0)


    # Construcción del informe
    informe_detallado = []
    for partido in partidos:
        df_partido = departamento_df.copy()

        rows = []
        for _, row in df_partido.iterrows():
            emitidos = row['VOTO EMITIDO']
            base_total = row['VOTO VALIDO'] + row['VOTO BLANCO'] + row['VOTO NULO']
            participacion = (emitidos / base_total * 100) if base_total > 0 else 0

            rows.append({
                'departamento': row['Departamento'],
                'validos': int(row[partido]),
                'blancos': int(row['VOTO BLANCO']),
                'nulos': int(row['VOTO NULO']),
                'emitidos': int(row['VOTO EMITIDO']),
                'participacion': round(participacion, 2)
            })


        total_validos = sum([r['validos'] for r in rows])
        total_blancos = sum([r['blancos'] for r in rows])
        total_nulos = sum([r['nulos'] for r in rows])
        total_emitidos = sum([r['emitidos'] for r in rows])
        total_base = total_validos + total_blancos + total_nulos
        total_participacion = (total_emitidos / total_base * 100) if total_base > 0 else 0

       # 🎯 Gráfico de pastel por partido
        labels = ['Votos válidos', 'Votos blancos', 'Votos nulos']
        sizes = [total_validos, total_blancos, total_nulos]
        colors = ['#007bff', '#d1d1d1', '#888']

        plt.figure(figsize=(4, 4))
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
        plt.title(f'Distribución de votos - {partido}')
        os.makedirs("static", exist_ok=True)
        plt.savefig(f"static/pastel_{partido.lower().replace(' ', '_')}.png", bbox_inches='tight')
        plt.close()


        informe_detallado.append({
            'partido': partido,
            'total_validos': total_validos,
            'total_blancos': total_blancos,
            'total_nulos': total_nulos,
            'total_emitidos': total_emitidos,
            'total_participacion': round(total_participacion, 2),
            'departamentos': rows
        })

    # 📝 Informe simple por partido (solo total nacional por provincia)
    informe = []
    for p in partidos:
        total = int(df[p].sum())
        por_provincia = []
        for _, row in df.iterrows():
            por_provincia.append({
                'departamento': row['Provincia'],
                'votos': int(row[p])
            })
        informe.append({
            'partido': p,
            'total': f"{total:,}".replace(",", "."),
            'departamentos': por_provincia
        })

    return render_template(
        'informe.html',
        informe=informe,
        # 📘 Tabla de coeficiente (puede ser decorativa si no se usa actualmente)
        coef_table = [("Modelo logístico", "Probabilidad de ganar basado en % de votos de otros partidos")],

        partidos=partidos,
        partido_seleccionado=partido_seleccionado,
        informe_detallado=informe_detallado
    )


if __name__ == '__main__':
    from os import getenv
    port = int(getenv("PORT", 5003))  # Puerto por defecto 5003
    app.run(host='0.0.0.0', port=port, debug=False)
