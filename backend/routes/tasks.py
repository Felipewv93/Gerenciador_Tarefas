from models import Task, db
from flask import Flask
from flask import jsonify, request
from flask_cors import CORS
from datetime import datetime
from datetime import date, timedelta
import pytz

app = Flask(__name__)
CORS(app)

@app.route('/tasks', methods=['GET'])
def listar_tarefas():
    tarefas = Task.query.all()
    return jsonify([t.to_dict() for t in tarefas]), 200


@app.route('/tasks/today', methods=['GET'])
def listar_tarefas_hoje():
    """Retorna apenas as tarefas cujo campo `prazo` é do dia atual.

    A comparação é feita considerando intervalo [start_of_today, start_of_tomorrow),
    para ignorar a parte horário armazenada em `prazo`.
    """
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    tarefas = Task.query.filter(Task.prazo >= start, Task.prazo < end).all()
    return jsonify([t.to_dict() for t in tarefas]), 200

@app.route('/tasks', methods=['POST'])
def criar_tarefa():
    dados = request.json
    
    prazo = dados.get('prazo')
    if prazo:
        try:
            # Tenta primeiro no formato ISO (YYYY-MM-DD) vindo do input datetime-local
            prazo = datetime.strptime(prazo, "%Y-%m-%d")
        except ValueError:
            try:
                # Se falhar, tenta formato brasileiro (DD/MM/YYYY)
                prazo = datetime.strptime(prazo, "%d/%m/%Y")
            except ValueError:
                prazo = None
        
        # Validação: não permite prazo no passado (usando fuso horário do Brasil)
        if prazo:
            fuso_brasil = pytz.timezone('America/Sao_Paulo')
            hoje_brasil = datetime.now(fuso_brasil).date()
            if prazo.date() < hoje_brasil:
                return jsonify({'error': 'O prazo não pode ser uma data no passado'}), 400

    nova_tarefa = Task(
        nome=dados['nome'],
        descricao=dados['descricao'],
        prazo=prazo
    )
    db.session.add(nova_tarefa)
    db.session.commit()
    return jsonify(nova_tarefa.to_dict()), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def editar_tarefa(task_id):
    tarefa = Task.query.get_or_404(task_id)
    dados = request.json

    prazo = dados.get('prazo')
    if prazo:
        try:
            # Tenta primeiro no formato ISO (YYYY-MM-DD)
            prazo = datetime.strptime(prazo, "%Y-%m-%d")
        except ValueError:
            try:
                # Se falhar, tenta formato brasileiro (DD/MM/YYYY)
                prazo = datetime.strptime(prazo, "%d/%m/%Y")
            except ValueError:
                prazo = tarefa.prazo  # mantém o anterior
        
        # Validação: não permite prazo no passado (só para tarefas pendentes, usando fuso horário do Brasil)
        if prazo and tarefa.status == 'Pendente':
            fuso_brasil = pytz.timezone('America/Sao_Paulo')
            hoje_brasil = datetime.now(fuso_brasil).date()
            if prazo.date() < hoje_brasil:
                return jsonify({'error': 'O prazo não pode ser uma data no passado'}), 400

    tarefa.nome = dados.get('nome', tarefa.nome)
    tarefa.descricao = dados.get('descricao', tarefa.descricao)
    tarefa.prazo = prazo

    db.session.commit()
    return jsonify(tarefa.to_dict()), 200

@app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
def concluir_tarefa(task_id):
    tarefa = Task.query.get_or_404(task_id)
    tarefa.status = 'Concluída'
    # Define o fuso horário do Brasil (Brasília)
    fuso_brasil = pytz.timezone('America/Sao_Paulo')
    tarefa.data_conclusao = datetime.now(fuso_brasil).replace(tzinfo=None)
    db.session.commit()
    return jsonify(tarefa.to_dict()), 200

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def deletar_tarefa(task_id):
    tarefa = Task.query.get_or_404(task_id)
    db.session.delete(tarefa)
    db.session.commit()
    return jsonify({'message': 'Tarefa deletada com sucesso'}), 200