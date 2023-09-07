import {db} from "../db";
import {RowDataPacket} from "mysql2";
import {Package} from "../types/package";

export const get = (packageId: string, callback: Function) => {
    const queryString = `
        SELECT 
            *
        FROM packs 
        WHERE pack_id=?`

    db.query(
        queryString,
        [packageId],
        (error, result) => {
            if (error) {
                callback(error);
            }

            const rows = (<RowDataPacket[]> result);

            if (rows.length > 0) {
                const packages: Package[] = rows.map(row => new class implements Package {
                    id: string = row.id;
                    packageId: string = row.pack_id;
                    productId: string = row.product_id;
                    quantity: number = row.qty;
                });

                callback(null, packages);
            } else {
                callback(null, null);
            }
        }
    );
};