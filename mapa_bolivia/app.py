from flask import Flask, render_template, request
import cv2
import numpy as np
import os
import base64
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__)

# Función de redimensionamiento
def resize_image(img, target_size):
    return cv2.resize(img, target_size, interpolation=cv2.INTER_LINEAR)

# Función para generar mapa interpolado
def generate_interpolated_map(year, image_files):
    years = sorted([int(f.split()[-1].replace(".png", "")) for f in image_files])

    if year in years:
        img = cv2.imread(f"static/images/Mapa de Bolivia {year}.png", cv2.IMREAD_GRAYSCALE)
        return img

    before = max([y for y in years if y <= year], default=None)
    after = min([y for y in years if y >= year], default=None)

    if before is None or after is None:
        return None

    img_before = cv2.imread(f"static/images/Mapa de Bolivia {before}.png", cv2.IMREAD_GRAYSCALE)
    img_after = cv2.imread(f"static/images/Mapa de Bolivia {after}.png", cv2.IMREAD_GRAYSCALE)

    target_size = (min(img_before.shape[1], img_after.shape[1]), min(img_before.shape[0], img_after.shape[0]))
    img_before = resize_image(img_before, target_size)
    img_after = resize_image(img_after, target_size)

    alpha = (year - before) / (after - before)
    interpolated_img = cv2.addWeighted(img_before, 1 - alpha, img_after, alpha, 0)

    return interpolated_img

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        year_to_generate = int(request.form["year"])
        image_files = [f for f in os.listdir("static/images") if f.startswith("Mapa de Bolivia") and f.endswith(".png")]
        result_img = generate_interpolated_map(year_to_generate, image_files)

        if result_img is not None:
            _, img_encoded = cv2.imencode(".png", result_img)
            img_base64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")
            return render_template("index.html", img_data=img_base64, year=year_to_generate)
        else:
            return "No se puede generar el mapa para ese año."

    return render_template("index.html")

if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)
