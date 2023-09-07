import {db} from "../db";
import { RowDataPacket } from "mysql2";
import {Product} from "../types/product";

export const get = (code: string, callback: Function) => {
    const queryString = `
        SELECT 
          *
        FROM products
        WHERE code=?`

    db.query(
        queryString,
        [code],
        (err, result) => {
            if (err) {
                callback(err);
            }

            const rows = (<RowDataPacket[]> result);

            if (rows.length > 0) {
                const row = rows[0];

                const product: Product = new class implements Product {
                    code: string = row.code;
                    name: string = row.name;
                    costPrice: number = Number(row.cost_price);
                    salesPrice: number = Number(row.sales_price);
                };

                callback(null, product);
            } else {
                callback(new Error("Produto não encontrado."));
            }
        }
    );
}

export const getMany = (codes: string[], callback: Function) => {
    const queryString = `
        SELECT 
          *
        FROM products
        WHERE code IN(${codes.join(',')})`

    db.query(
        queryString,
        [],
        async (err, result) => {
            if (err) {
                await callback(err);
            }

            const rows = (<RowDataPacket[]>result);

            if (rows.length > 0) {
                const products: Product[] = rows.map(row => new class implements Product {
                    code: string = row.code;
                    name: string = row.name;
                    costPrice: number = Number(row.cost_price);
                    salesPrice: number = Number(row.sales_price);
                });

                await callback(null, products);
            } else {
                await callback(null, null);
            }
        }
    );
}

export const update = (productCode: string, newPrice: number, callback: Function) => {
    const queryString = `
        UPDATE products SET sales_price=? WHERE code=?`;

    db.query(
        queryString,
        [newPrice, productCode],
        (err) => {
            if (err) {callback(err)}
            callback(null);
        }
    );
}