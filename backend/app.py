from models import db
from database import DatabaseConfig
from routes.tasks import app

app.config.from_object(DatabaseConfig)

db.init_app(app)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)