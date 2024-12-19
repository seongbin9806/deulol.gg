from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

# 안전한 글로벌 허용
torch.serialization.add_safe_globals([LinearRegression])

# 모델 로드 함수
def load_model(path):
    try:
        model_data = torch.load(path, weights_only=False)
        if 'model' not in model_data or 'scaler' not in model_data:
            raise ValueError(f"Model file {path} is missing 'model' or 'scaler' keys.")
        print(f"Model {path} loaded successfully.")  # 로드 확인 로그
        return model_data
    except Exception as e:
        print(f"Error loading model {path}: {e}")
        return None

# 모델 딕셔너리
models = {
    "TOP": load_model('./ranked_top_model.pt'),
    "JUNGLE": load_model('./ranked_jungle_model.pt'),
    "MIDDLE": load_model('./ranked_middle_model.pt'),
    "BOTTOM": load_model('./ranked_bottom_model.pt'),
    "UTILITY": load_model('./ranked_utility_model.pt'),
    "ARAM": load_model('./aram_model.pt')  # ARAM 모델
}

@app.route('/ai_score', methods=['POST'])
def calculate_ai_score():
    try:
        data = request.json
        print("Received data:", data)  # 요청 데이터 출력
        
        # features 가져오기
        features = data.get("features")
        if not features:
            return jsonify({"error": "Missing features"}), 400

        # ARAM 처리 (position 없음)
        position = data.get("position", "ARAM")
        if position == "ARAM":
            model_data = models["ARAM"]
            
            # ARAM 요청에서 vision_score와 cs 제거
            features = {key: value for key, value in features.items() if key not in ["vision_score", "cs"]}
            print("Filtered features for ARAM:", features)
        else:
            if position not in models or not models[position]:
                return jsonify({"error": f"Position '{position}' not supported or model failed to load"}), 400
            model_data = models[position]

        # 모델 및 스케일러 로드
        model = model_data['model']
        scaler = model_data['scaler']

        # DataFrame 변환 및 스케일링
        features_df = pd.DataFrame([features])
        print("Features DataFrame:", features_df)
        scaled_features = scaler.transform(features_df)
        print("Scaled features:", scaled_features)

        # 예측 수행
        ai_score = model.predict(scaled_features)[0]
        
        # AI_SCORE 클리핑 및 반올림
        ai_score = round(max(0, min(100, ai_score)), 1)  # 0~100 사이로 제한 후 소수점 첫째 자리 반올림
        print("Clipped and Rounded AI Score:", ai_score)

        return jsonify({"ai_score": ai_score})

    except Exception as e:
        print("Error during prediction:", e)  # 오류 로그 출력
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8090, debug=True)