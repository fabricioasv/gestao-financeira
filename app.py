from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import os
import pandas as pd
from werkzeug.utils import secure_filename
import json
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'financas_pessoais_2024'

# Configurações
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_current_month():
    """Retorna o mês atual no formato '25-XX'"""
    now = datetime.now()
    return f"25-{now.month:02d}"

def is_future_month(month_str):
    """Verifica se o mês é futuro (maior que o mês atual)"""
    current_month = get_current_month()
    return month_str > current_month

def process_excel_data(file_path):
    """Processa o arquivo Excel e retorna os dados estruturados"""
    try:
        # Ler aba "Consolidado"
        df_consolidado = pd.read_excel(file_path, sheet_name='Consolidado')
        
        # Ler aba "Ações"
        df_acoes = pd.read_excel(file_path, sheet_name='Ações')
        
        # Ler aba "Proventos"
        df_proventos = pd.read_excel(file_path, sheet_name='Proventos')
        
        # Extrair meses das colunas da aba Consolidado
        months = [col for col in df_consolidado.columns if col.startswith('25-')]
        months.sort()
        
        # Preparar dados para a tabela (aba Consolidado)
        table_data = []
        for _, row in df_consolidado.iterrows():
            if pd.notna(row['Alias']):
                row_data = {
                    'alias': str(row['Alias']),
                    'id': str(row['Id']) if pd.notna(row['Id']) else '',
                    'months': {}
                }
                
                for month in months:
                    value = row[month] if pd.notna(row[month]) else 0
                    row_data['months'][month] = float(value)
                
                table_data.append(row_data)
        
        # Preparar dados da aba Ações
        acoes_data = []
        if df_acoes is not None and len(df_acoes) > 0:
            for _, row in df_acoes.iterrows():
                if pd.notna(row.get('Ticker', '')):
                    def process_numeric_value(col_name, default=0):
                        """Função auxiliar para processar valores numéricos"""
                        value = default
                        if pd.notna(row.get(col_name, default)):
                            try:
                                if isinstance(row[col_name], str):
                                    clean_val = row[col_name].replace('R$', '').replace(',', '.').strip()
                                    value = float(clean_val)
                                else:
                                    value = float(row[col_name])
                            except:
                                value = default
                        return value
                    
                    acao_data = {
                        'ticker': str(row.get('Ticker', '')),
                        'qtd': process_numeric_value('Qtd'),
                        'div_esperado_2025': process_numeric_value('Div. Esperado\n2025'),
                        'renda_esperada': process_numeric_value('Renda Esperada'),
                        'capital_atual': process_numeric_value('Capital Atual'),
                        'dividend_yield_esperado': process_numeric_value('Dividend Yield Esperado') * 100,
                        'dividend_yield_pago': process_numeric_value('Dividend Yield Pago'),
                        'proporcao_hoje': process_numeric_value('Proporção Hoje'),
                        'meta_28k': process_numeric_value('Meta 28k'),
                        'meta_1_ano': process_numeric_value('Meta +1.a.'),
                        'meta_qtd_2033': process_numeric_value('Meta qtd. 2033')
                    }
                    
                    # Calcular resultado (mantendo compatibilidade)
                    acao_data['resultado'] = acao_data['renda_esperada'] - acao_data['dividend_yield_pago']
                    acoes_data.append(acao_data)
        
        # Preparar dados da aba Proventos
        proventos_data = []
        if df_proventos is not None and len(df_proventos) > 0:
            # Extrair meses da primeira linha (cabeçalhos)
            month_headers = []
            month_names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            
            for col in df_proventos.columns[1:]:  # Pular a primeira coluna (Ano)
                if pd.notna(col):
                    col_str = str(col)
                    # Verificar se é um timestamp de data
                    if isinstance(col, (pd.Timestamp, datetime)):
                        month_index = col.month - 1  # month é 1-12, precisamos 0-11
                        month_name = month_names[month_index]
                        month_headers.append(month_name)
                    # Verificar se contém apenas números (ignorar colunas como Total, Média, etc.)
                    elif col_str.replace('-', '').replace(':', '').replace(' ', '').replace('.', '').isdigit():
                        # Se for apenas números, é provavelmente um mês
                        month_index = col.month - 1 if hasattr(col, 'month') else 0
                        month_name = month_names[month_index]
                        month_headers.append(month_name)
                    # Verificar se é um nome de mês
                    elif any(month_name in col_str for month_name in month_names):
                        for month_name in month_names:
                            if month_name in col_str:
                                month_headers.append(month_name)
                                break
            
            # Processar dados de proventos linha por linha
            for _, row in df_proventos.iterrows():
                # Verificar se a primeira coluna contém um ano válido
                year_cell = row.iloc[0]
                if pd.notna(year_cell) and str(year_cell).isdigit():
                    year = int(year_cell)
                    year_data = {
                        'year': year,
                        'months': {},
                        'total': 0
                    }
                    
                    total_year = 0
                    # Processar cada coluna de mês (começando da segunda coluna)
                    for i, month_header in enumerate(month_headers):
                        if i + 1 < len(row):  # +1 porque a primeira coluna é o ano
                            value = row.iloc[i + 1] if pd.notna(row.iloc[i + 1]) else 0
                            try:
                                value = float(value)
                            except:
                                value = 0
                            year_data['months'][month_header] = value
                            total_year += value
                    
                    year_data['total'] = total_year
                    proventos_data.append(year_data)
        
        # Preparar dados para gráficos
        chart_data = {
            'months': months,
            'consolidated': {
                'credito_realizado': [],
                'debitos_realizado': [],
                'debitos_previsto': [],
                'consolidado': []
            },
            'cartao': {
                'cartao_dti': [],
                'sicredi': [],
                'porto_bank': [],
                'btg': [],
                'cartao_consolidado': []
            },
            'investimento': {
                'acoes': [],
                'renda_fixa': [],
                'previdencia_privada': []
            }
        }
        
        # Calcular dados consolidados
        for month in months:
            credito_realizado = 0
            debitos_realizado = 0
            debitos_previsto = 0
            
            for row in table_data:
                value = row['months'][month]
                # Créditos: categorias que contêm "Créditos" e "Realizado"
                if 'Créditos' in row['alias'] and 'Realizado' in row['alias']:
                    credito_realizado += value if value > 0 else 0
                # Débitos Realizado: categorias que contêm "Débitos" e "Realizado"
                elif 'Débitos' in row['alias'] and 'Realizado' in row['alias']:
                    debitos_realizado += abs(value) if value < 0 else value
                # Débitos Previsto: categorias que contêm "Débitos" e "Previsto"
                elif 'Débitos' in row['alias'] and 'Previsto' in row['alias']:
                    debitos_previsto += abs(value) if value < 0 else value
                # Fallback para categoria específica "Débitos" (sem Previsto/Realizado)
                elif row['alias'] == 'Débitos':
                    if is_future_month(month):
                        debitos_previsto += abs(value) if value < 0 else value
                    else:
                        debitos_realizado += abs(value) if value < 0 else value
            
            # Para meses futuros, usar previsto; para meses passados, usar realizado
            if is_future_month(month):
                debitos_final = debitos_previsto
            else:
                debitos_final = debitos_realizado
            
            consolidado = credito_realizado - debitos_final
            
            chart_data['consolidated']['credito_realizado'].append(credito_realizado)
            chart_data['consolidated']['debitos_realizado'].append(debitos_realizado)
            chart_data['consolidated']['debitos_previsto'].append(debitos_previsto)
            chart_data['consolidated']['consolidado'].append(consolidado)
        
        # Calcular dados do cartão
        for month in months:
            cartao_dti = 0
            sicredi = 0
            porto_bank = 0
            btg = 0
            cartao_consolidado = 0
            
            for row in table_data:
                value = row['months'][month]
                if 'Cartão dti' in row['alias'] and 'Realizado' in row['alias']:
                    cartao_dti = abs(value) if value < 0 else value
                elif 'Sicredi' in row['alias'] and 'Realizado' in row['alias']:
                    sicredi = abs(value) if value < 0 else value
                elif 'Porto Bank' in row['alias'] and 'Realizado' in row['alias']:
                    porto_bank = abs(value) if value < 0 else value
                elif 'BTG' in row['alias'] and 'Realizado' in row['alias']:
                    btg = abs(value) if value < 0 else value
                elif '[C] Cartão' in row['alias']:
                    cartao_consolidado = abs(value) if value < 0 else value
            
            chart_data['cartao']['cartao_dti'].append(cartao_dti)
            chart_data['cartao']['sicredi'].append(sicredi)
            chart_data['cartao']['porto_bank'].append(porto_bank)
            chart_data['cartao']['btg'].append(btg)
            chart_data['cartao']['cartao_consolidado'].append(cartao_consolidado)
        
        # Calcular dados de investimento
        for month in months:
            acoes = 0
            renda_fixa = 0
            previdencia_privada = 0
            
            for row in table_data:
                value = row['months'][month]
                if 'Investimento' in row['alias'] and 'Ações' in row['alias']:
                    acoes = abs(value) if value < 0 else value
                elif 'Investimento' in row['alias'] and 'Renda Fixa' in row['alias']:
                    renda_fixa = abs(value) if value < 0 else value
                elif 'Previdência Privada' in row['alias']:
                    previdencia_privada = abs(value) if value < 0 else value
            
            chart_data['investimento']['acoes'].append(acoes)
            chart_data['investimento']['renda_fixa'].append(renda_fixa)
            chart_data['investimento']['previdencia_privada'].append(previdencia_privada)
        
        return {
            'success': True,
            'table_data': table_data,
            'chart_data': chart_data,
            'acoes_data': acoes_data,
            'proventos_data': proventos_data
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/')
def index():
    """Página principal com upload e visualização"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Endpoint para upload de arquivos Excel"""
    if 'file' not in request.files:
        flash('Nenhum arquivo selecionado')
        return redirect(request.url)
    
    file = request.files['file']
    if file.filename == '':
        flash('Nenhum arquivo selecionado')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Processar dados
        result = process_excel_data(file_path)
        
        if result['success']:
            # Salvar dados na sessão (em produção, usar banco de dados)
            return jsonify(result)
        else:
            return jsonify({'success': False, 'error': result['error']})
    
    flash('Tipo de arquivo não permitido')
    return redirect(request.url)

@app.route('/load_default')
def load_default():
    """Carrega os dados padrão do arquivo dados.xlsx"""
    try:
        result = process_excel_data('dados.xlsx')
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
