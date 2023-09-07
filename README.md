# ecommerce-csv

## backend

Para iniciar a aplicação, pode-se utilizar o seguinte comando no terminal dentro da pasta backend:

<code>npm start</code>

Além disso, deve-se modificar a conexão do MySQL no arquivo .env caso necessário.

## frontend

Para iniciar a aplicação, pode-se utilizar o seguinte comando no terminal dentro da pasta frontend:

<code>npm run dev</code>

O sistema aceita arquivos .csv com as seguintes colunas:

- <code>product_code,new_price</code>;
- <code>package_id,new_price</code>;
- <code>product_code,package_id,new_price</code>.

Se comportando de maneira diferente conforme informado o código do produto ou o id do pacote. Sendo importante ressaltar que só pode ser informado o valor para apenas uma dessas colunas por linha na hora da importação.

Os arquivos iniciais de criação de banco e exemplo de .csv são os seguintes:

- [database.sql](backend/database.sql);
- [atualizacao_preco_exemplo.csv](frontend/atualizacao_preco_exemplo.csv).
