import {ChangeEvent, useState} from 'react'
import csv from 'csvtojson'
import './App.css'

function App() {
    const [file, setFile] = useState<File>();
    const [validate, setValidate] = useState(false);
    const [update, setUpdate] = useState(false);
    const [lines, setLines] = useState<any[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }

        if (file === undefined) {
            return;
        }
    }

    const validateOnClick = async () => {
        setValidate(true);

        if (file === undefined) {
            return;
        }

        let products: any[] = [];

        csv({flatKeys:true})
            .fromString(await file.text())
            .subscribe(json => {
                if (!json['new_price']) {
                    alert("É necessário ter a coluna 'new_price' no arquivo .csv.");
                    return;
                }

                if (!json['product_code'] && !json['package_id']) {
                    alert("É necessário ter a coluna 'product_code' ou 'package_id' no arquivo .csv.");
                    return;
                }

                if (json['product_code'] && json['package_id']) {
                    alert("É necessário ter somente a coluna 'product_code' ou 'package_id' preenchida.");
                    return;
                }

                products.push(json);
            }, error => {
                console.log(error)
            }, async () => {
                if (products.length === 0) {
                    alert('Insira pelo menos uma linha no arquivo.');
                    return;
                }

                const response = await fetch('http://localhost:3000/products/validate', {
                    method: 'POST',
                    body: JSON.stringify(products),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                const result = await response.json();

                setLines(result.data);
            });

        setValidate(false);
    }

    const updateOnClick = async () => {
        setUpdate(true);

        const response = await fetch('http://localhost:3000/products/update', {
            method: 'POST',
            body: JSON.stringify(lines),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();

        if (result.success) {
            setLines([]);
        } else {
            alert(result.message)
        }

        setUpdate(false);
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <input
                    type="file"
                    accept=".csv"
                    className="file-input file-input-md w-full max-w-xs flex items-center space-x-6"
                    onChange={handleFileChange} />
                <button
                    onClick={validateOnClick}
                    className="btn btn-secondary"
                    disabled={file === undefined || validate}
                >
                    Validar
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Preço Atual</th>
                            <th>Novo Preço</th>
                            <th>Crítica</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        lines.length > 0
                            ? lines.map((line, i) => (
                                <tr className="hover">
                                    <td>{i + 1}</td>
                                    <td>{line.code}</td>
                                    <td>{line.name}</td>
                                    <td>{line.price}</td>
                                    <td>{line.newPrice}</td>
                                    <td>{line.error}</td>
                                </tr>))
                            : <tr className="text-center">
                                <td colSpan={6}>Nenhum produto disponível!</td>
                            </tr>
                    }
                    </tbody>
                </table>
            </div>
            <button
                onClick={updateOnClick}
                className="btn btn-primary"
                disabled={(lines.length === 0 || lines.some(line => line.error) || update)}
            >
                Atualizar
            </button>
        </>
    )
}

export default App
