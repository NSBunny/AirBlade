from flask import Flask, render_template, Response
from src.main import FruitNinjaApp

app = Flask(__name__)

# Initialize game engine
# Global instance removed to allow full restart per connection

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    # Instantiate a new game app for each connection
    # This ensures the camera is opened fresh and state is reset
    game = FruitNinjaApp()
    return Response(game.generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)
