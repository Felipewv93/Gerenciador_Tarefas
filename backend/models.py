from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

db = SQLAlchemy()

def get_brasilia_time():
    """Retorna o horário atual no fuso do Brasil"""
    fuso_brasil = pytz.timezone('America/Sao_Paulo')
    return datetime.now(fuso_brasil).replace(tzinfo=None)

class Task(db.Model):

    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(10), default='Pendente')
    data_criacao = db.Column(db.DateTime, default=get_brasilia_time)
    prazo = db.Column(db.DateTime, nullable=True)
    data_conclusao = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Task {self.nome} - {self.status}>'
    

    @property
    def status_atual(self):
        """Retorna o status atual da tarefa, considerando se está atrasada"""
        if self.status == 'Concluída':
            return 'Concluída'
        
        if self.prazo and get_brasilia_time().date() > self.prazo.date():
            return 'Atrasada'
        
        return 'Pendente'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'status': self.status_atual,
            'data_criacao': self.data_criacao.strftime('%d/%m/%Y') if self.data_criacao else None,
            'prazo': self.prazo.strftime('%d/%m/%Y') if self.prazo else None,
            'data_conclusao': self.data_conclusao.strftime('%d/%m/%Y %H:%M:%S') if self.data_conclusao else None
        }