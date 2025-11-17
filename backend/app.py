from models import db
from database import DatabaseConfig
from routes.tasks import app
import os

app.config.from_object(DatabaseConfig)

db.init_app(app)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
