from flask import Flask, render_template, request, jsonify
import numpy as np
import base64, os
from PIL import Image
import io

from config import Config
from models.generator import TumorGenerator

app = Flask(__name__)
app.config.from_object(Config)

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["OUTPUT_FOLDER"], exist_ok=True)

generator = TumorGenerator(Config)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """
    接收前端参数，调用生成器，返回结果
    请求体 (JSON):
        mask_b64: base64 编码的手绘mask图像
        size_cm: 肿瘤大小 (float)
        shape: 形态类型 (round/irregular/ring)
        grade: WHO分级 (1-4)
        edema_range: 水肿范围 (float)
        enhancement: 是否强化 (bool)
    """
    try:
        data = request.get_json()

        # 解析 mask
        mask = _decode_mask(data.get("mask_b64", ""), Config.IMAGE_SIZE)

        result = generator.generate(
            mask=mask,
            size_cm=float(data.get("size_cm", 3.0)),
            shape=data.get("shape", "irregular"),
            grade=int(data.get("grade", 2)),
            edema_range=float(data.get("edema_range", 1.5)),
            enhancement=bool(data.get("enhancement", False))
        )

        return jsonify({"status": "ok", **result})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/clear_mask", methods=["POST"])
def clear_mask():
    return jsonify({"status": "ok"})


def _decode_mask(b64_str: str, size: int) -> np.ndarray:
    """将 base64 canvas 图像解码为二值 numpy mask"""
    if not b64_str:
        return np.zeros((size, size), dtype=np.float32)

    # 去掉 data:image/png;base64, 前缀
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]

    img_bytes = base64.b64decode(b64_str)
    img = Image.open(io.BytesIO(img_bytes)).convert("L").resize((size, size))
    arr = np.array(img, dtype=np.float32) / 255.0
    return (arr > 0.1).astype(np.float32)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
