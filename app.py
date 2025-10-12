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

        # Ler aba "Proventos"
        df_proventos = pd.read_excel(file_path, sheet_name='Proventos')
        
        # Ler aba "Cartão"
        df_cartao = pd.read_excel(file_path, sheet_name='Cartão')
        
        # Ler aba "Cartão-Detalhe"
        df_cartao_detalhe = pd.read_excel(file_path, sheet_name='Cartão-Detalhe')
        
        # Ler aba "Ações-Carteira"
        df_acoes_carteira = pd.read_excel(file_path, sheet_name='Ações-Carteira')
        
        # Ler aba "Proventos-Recebidos"
        df_proventos_recebidos = pd.read_excel(file_path, sheet_name='Proventos-Recebidos')
        
        # Ler aba "Renda-Projetiva"
        df_renda_projetiva = pd.read_excel(file_path, sheet_name='Renda-Projetiva')
        
        # Ler aba "Proventos-A-Receber"
        df_proventos_a_receber = pd.read_excel(file_path, sheet_name='Proventos-A-Receber')
        
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
                        'total': 0,
                        'variacao': 0
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
        
        # Calcular variação percentual entre anos consecutivos
        if len(proventos_data) > 1:
            # Ordenar por ano para garantir ordem correta
            proventos_data.sort(key=lambda x: x['year'])
            
            for i in range(len(proventos_data)):
                if i == 0:
                    # Primeiro ano não tem variação
                    proventos_data[i]['variacao'] = 0
                else:
                    ano_atual = proventos_data[i]['total']
                    ano_anterior = proventos_data[i-1]['total']
                    
                    if ano_anterior != 0:
                        variacao = ((ano_atual - ano_anterior) / ano_anterior) * 100
                        proventos_data[i]['variacao'] = round(variacao, 2)
                    else:
                        proventos_data[i]['variacao'] = 0 if ano_atual == 0 else 100
        
        # Preparar dados da aba Cartão
        cartao_data = []
        if df_cartao is not None and len(df_cartao) > 0:
            # Extrair meses das colunas (excluindo a primeira coluna 'Grupo')
            cartao_months = []
            for col in df_cartao.columns[1:]:
                if isinstance(col, (pd.Timestamp, datetime)):
                    month_str = f"{col.year}-{col.month:02d}"
                    cartao_months.append(month_str)
            
            # Processar dados de cartão linha por linha
            for _, row in df_cartao.iterrows():
                if pd.notna(row.get('Grupo', '')):
                    grupo_data = {
                        'grupo': str(row['Grupo']),
                        'months': {}
                    }
                    
                    for i, month in enumerate(cartao_months):
                        if i + 1 < len(row):  # +1 porque a primeira coluna é o Grupo
                            value = row.iloc[i + 1] if pd.notna(row.iloc[i + 1]) else 0
                            try:
                                value = float(value)
                            except:
                                value = 0
                            grupo_data['months'][month] = value
                    
                    cartao_data.append(grupo_data)
        
        # Preparar dados da aba Cartão-Detalhe
        cartao_detalhe_data = []
        if df_cartao_detalhe is not None and len(df_cartao_detalhe) > 0:
            for _, row in df_cartao_detalhe.iterrows():
                if pd.notna(row.get('Fatura', '')):
                    detalhe_data = {
                        'fatura': str(row['Fatura']),
                        'data': str(row['Data']) if pd.notna(row['Data']) else '',
                        'estabelecimento': str(row['Estabelecimento']) if pd.notna(row['Estabelecimento']) else '',
                        'valor': float(row['Valor']) if pd.notna(row['Valor']) else 0,
                        'cartao': str(row['Cartão']) if pd.notna(row['Cartão']) else '',
                        'estabelecimento_fmt': str(row['Estabelecimento Fmt']) if pd.notna(row['Estabelecimento Fmt']) else '',
                        'grupo': str(row['Grupo']) if pd.notna(row['Grupo']) else ''
                    }
                    cartao_detalhe_data.append(detalhe_data)
        
        # Preparar dados da aba Ações-Carteira
        acoes_carteira_data = []
        if df_acoes_carteira is not None and len(df_acoes_carteira) > 0:
            for _, row in df_acoes_carteira.iterrows():
                if pd.notna(row.get('Ticker', '')):
                    def process_numeric_value_carteira(col_name, default=0):
                        """Função auxiliar para processar valores numéricos da carteira"""
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
                    
                    carteira_data = {
                        'ticker': str(row.get('Ticker', '')),
                        'amount': process_numeric_value_carteira('Amount'),
                        'average_price': process_numeric_value_carteira('Average Price'),
                        'nota': process_numeric_value_carteira('Nota\n0-7'),
                        'r_alvo': process_numeric_value_carteira('R$ Alvo'),
                        'r_base_pt': process_numeric_value_carteira('R$ Base\np/ PT'),
                        'ultima_atualizacao': str(row.get('Última Atual.', '')) if pd.notna(row.get('Última Atual.', '')) else '',
                        'desvio_pl_proj': process_numeric_value_carteira('Desvio PL Proj.'),
                        'cagr_lcr_5a': process_numeric_value_carteira('CAGR LCR (5A)'),
                        'div_l_ebitda': process_numeric_value_carteira('Div. L/\nEBITDA'),
                        'div_proj': process_numeric_value_carteira('Div. Proj.'),
                        'pct_div_proj': process_numeric_value_carteira('% Div. Proj.') * 100
                    }
                    acoes_carteira_data.append(carteira_data)
        
        # Preparar dados da aba Proventos-Recebidos
        proventos_recebidos_data = []
        if df_proventos_recebidos is not None and len(df_proventos_recebidos) > 0:
            for _, row in df_proventos_recebidos.iterrows():
                if pd.notna(row.get('Ticker', '')):
                    def process_numeric_value_recebidos(col_name, default=0):
                        """Função auxiliar para processar valores numéricos dos proventos recebidos"""
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
                    
                    # Processar data de pagamento
                    pagamento_str = ''
                    if pd.notna(row.get('Pagamento', '')):
                        pagamento = row['Pagamento']
                        if isinstance(pagamento, (pd.Timestamp, datetime)):
                            pagamento_str = pagamento.strftime('%d/%m/%Y')
                        else:
                            pagamento_str = str(pagamento)
                    
                    recebido_data = {
                        'ticker': str(row.get('Ticker', '')),
                        'pagamento': pagamento_str,
                        'mes': int(row.get('Mês', 0)) if pd.notna(row.get('Mês', 0)) else 0,
                        'referencia': int(row.get('Referencia', 0)) if pd.notna(row.get('Referencia', 0)) else 0,
                        'valor': process_numeric_value_recebidos('Valor'),
                        'valor_total': process_numeric_value_recebidos('Valor Total')
                    }
                    proventos_recebidos_data.append(recebido_data)
        
        # Preparar dados da aba Renda-Projetiva
        renda_projetiva_data = []
        if df_renda_projetiva is not None and len(df_renda_projetiva) > 0:
            for _, row in df_renda_projetiva.iterrows():
                if pd.notna(row.get('Ticker', '')) and pd.notna(row.get('Ano', '')):
                    def process_numeric_value_renda(col_name, default=0):
                        """Função auxiliar para processar valores numéricos da renda projetiva"""
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
                    
                    renda_data = {
                        'ticker': str(row.get('Ticker', '')),
                        'qtd_acoes': process_numeric_value_renda('Qtd. de ações'),
                        'dividendo_por_acao': process_numeric_value_renda('Dividendo por ação'),
                        'renda_anual_esperada': process_numeric_value_renda('Renda anual esperada'),
                        'capital_alocado': process_numeric_value_renda('Capital alocado'),
                        'dividend_yield': process_numeric_value_renda('Dividend Yield'),
                        'ano': int(row.get('Ano', 0)) if pd.notna(row.get('Ano', 0)) else 0,
                        'renda_anual': process_numeric_value_renda('Renda Anual'),
                        'renda_mensal': process_numeric_value_renda('Renda Mensal'),
                        'taxa_crescimento': process_numeric_value_renda('Taxa de crescimento (vs ano anterior)') * 100
                    }
                    renda_projetiva_data.append(renda_data)
        
        # Preparar dados da aba Proventos-A-Receber
        proventos_a_receber_data = []
        if df_proventos_a_receber is not None and len(df_proventos_a_receber) > 0:
            for _, row in df_proventos_a_receber.iterrows():
                if pd.notna(row.get('Ticker', '')):
                    def process_numeric_value_a_receber(col_name, default=0):
                        """Função auxiliar para processar valores numéricos dos proventos a receber"""
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
                    
                    # Processar data de pagamento
                    pagamento_str = ''
                    if pd.notna(row.get('Pagamento', '')):
                        pagamento = row['Pagamento']
                        if isinstance(pagamento, (pd.Timestamp, datetime)):
                            pagamento_str = pagamento.strftime('%d/%m/%Y')
                        else:
                            pagamento_str = str(pagamento)
                    
                    # Processar valores inteiros com validação
                    def process_int_value(col_name, default=0):
                        """Função auxiliar para processar valores inteiros"""
                        value = default
                        if pd.notna(row.get(col_name, default)):
                            try:
                                val = row[col_name]
                                if isinstance(val, str) and val.strip() in ['-', '', 'N/A']:
                                    value = default
                                else:
                                    value = int(float(val))
                            except:
                                value = default
                        return value
                    
                    a_receber_data = {
                        'ticker': str(row.get('Ticker', '')),
                        'pagamento': pagamento_str,
                        'mes': process_int_value('Mês'),
                        'referencia': process_int_value('Referencia'),
                        'valor': process_numeric_value_a_receber('Valor'),
                        'valor_total': process_numeric_value_a_receber('Valor Total')
                    }
                    proventos_a_receber_data.append(a_receber_data)
        
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
                'previdencia_privada': [],
                'cripto': []
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
            cripto = 0

            for row in table_data:
                value = row['months'][month]
                if 'Investimento' in row['alias'] and 'Ações' in row['alias']:
                    acoes = abs(value) if value < 0 else value
                elif 'Investimento' in row['alias'] and 'Renda Fixa' in row['alias']:
                    renda_fixa = abs(value) if value < 0 else value
                elif 'Investimento' in row['alias'] and 'Cripto' in row['alias']:
                    cripto = abs(value) if value < 0 else value
                elif 'Previdência Privada' in row['alias']:
                    previdencia_privada = abs(value) if value < 0 else value

            chart_data['investimento']['acoes'].append(acoes)
            chart_data['investimento']['renda_fixa'].append(renda_fixa)
            chart_data['investimento']['previdencia_privada'].append(previdencia_privada)
            chart_data['investimento']['cripto'].append(cripto)
        
        return {
            'success': True,
            'table_data': table_data,
            'chart_data': chart_data,
            'proventos_data': proventos_data,
            'cartao_data': cartao_data,
            'cartao_detalhe_data': cartao_detalhe_data,
            'acoes_carteira_data': acoes_carteira_data,
            'proventos_recebidos_data': proventos_recebidos_data,
            'renda_projetiva_data': renda_projetiva_data,
            'proventos_a_receber_data': proventos_a_receber_data
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
            print("✅ Dados processados com sucesso - retornando sucesso para refresh")
            response_data = {'success': True, 'message': '✅ Arquivo processado com sucesso! A página será recarregada automaticamente...'}
            print(f"📤 Retornando resposta: {response_data}")
            # Retornar sucesso para o frontend fazer refresh
            return jsonify(response_data)
        else:
            return jsonify({'success': False, 'error': result['error']})
    
    flash('Tipo de arquivo não permitido')
    return redirect(request.url)

@app.route('/load_default')
def load_default():
    """Carrega os dados da pasta uploads - sempre prioriza arquivos Excel mais recentes"""
    try:
        # Verificar se há arquivos na pasta uploads
        upload_files = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith(('.xlsx', '.xls'))]
        
        if upload_files:
            # Usar o arquivo mais recente da pasta uploads
            latest_file = max(upload_files, key=lambda f: os.path.getmtime(os.path.join(UPLOAD_FOLDER, f)))
            file_path = os.path.join(UPLOAD_FOLDER, latest_file)
            print(f"📁 Carregando arquivo mais recente: {file_path}")
            result = process_excel_data(file_path)
        else:
            # Se não houver arquivos em uploads, retornar erro
            print("❌ Nenhum arquivo Excel encontrado na pasta uploads")
            return jsonify({'success': False, 'error': 'Nenhum arquivo Excel encontrado na pasta uploads. Faça upload de uma planilha primeiro.'})
        
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erro ao carregar dados: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
