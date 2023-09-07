import express, {Request, Response} from "express";
import * as productModel from "../models/product";
import * as packageModel from "../models/package";
import {Product} from "../types/product";
import {Package} from "../types/package";
import {Payload} from "../types/payload";
import {Result} from "../types/result";

const productRouter = express.Router();

productRouter.post("/validate/", async (req: Request, res: Response) => {
    try {
        const data: Payload[] = [];

        for (let line of req.body) {
            await doProcess(line, data);
        }

        return res.status(200).json({"data": data});
    } catch (error: any) {
        return res.status(500).json({"message": error.message});
    }
});

productRouter.post("/update/", async (req: Request, res: Response) => {
    try {
        for (let line of req.body) {
            productModel.update(line["code"], Number(line["newPrice"]), (error: Error) => {
                if (error) {
                    return res.status(500).json({"success": false, "message": error.message});
                }
            });

        }

        return res.status(200).json({"success": true});
    } catch (error: any) {
        return res.status(500).json({"success": false, "message": error.message});
    }
});


const doProcess = async (line: any, data: Payload[]) => {
    const packageId = line["package_id"];
    const productCode = line["product_code"];

    if (isNaN(+line["new_price"])) {
        data.push(parseErrorReturn(packageId ?? productCode, "Informe um número válido."));
        return;
    }

    const newPrice = Number(line["new_price"]);

    if (packageId) {
        const packages = await new Promise<Package[]>((resolve, reject) => {
            packageModel.get(packageId, (error: Error, packages: Package[]) => {
                if (error) {
                    reject(error);
                }

                resolve(packages);
            });
        });

        const products = await new Promise<Product[]>((resolve, reject) => {
            productModel.getMany(packages.map(pack => pack.productId), (error: Error, products: Product[]) => {
                if (error) {
                    reject(error);
                }

                resolve(products);
            });
        });

        let totalPrice = 0;
        let totalCost = 0;

        for (let product of products) {
            const pack = packages.find(pack => pack.productId === product.code);

            if (!pack) {
                return;
            }

            totalPrice += product.salesPrice * pack.quantity;
            totalCost += product.costPrice * pack.quantity;
        }

        for (let product of products) {
            data.push(parseReturn(product, (((product.salesPrice * 100) / totalPrice) * newPrice) / 100))
        }
    } else {
        const product = await new Promise<Product>((resolve, reject) => {
            productModel.get(productCode, (error: Error, product: Product) => {
                if (error) {
                    if (error.message === "Produto não encontrado.") {
                        data.push(new class implements Payload {
                            code = productCode;
                            name = "";
                            price = 0;
                            newPrice = 0;
                            error = error.message;
                        });

                        resolve(product);
                    }

                    reject(error);
                }

                resolve(product);
            });
        });

        if (!product) {
            return;
        }

        data.push(parseReturn(product, newPrice))
    }
}

const validate = (product: Product, newPrice: number) => {
    if (newPrice < product.costPrice) {
        return new class implements Result {
            success = false;
            message = `Informe um preço maior que o preço de custo de ${product.costPrice}.`;
        };
    }

    const maxDiff = product.salesPrice * 0.1;
    const max = Math.round((product.salesPrice + maxDiff + Number.EPSILON) * 100) / 100;
    const min = Math.round((product.salesPrice - maxDiff + Number.EPSILON) * 100) / 100;

    if (newPrice > max || newPrice < min) {
        return new class implements Result {
            success = false;
            message = `Informe um preço entre ${min} e ${max}.`;
        };
    }

    return new class implements Result {
        success = true;
        message = ""
    };
}

const parseReturn = (product: Product, newPrice: number) => {
    newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

    const result = validate(product, newPrice);

    if (result.success) {
        return new class implements Payload {
            code = product.code;
            name = product.name;
            price = product.salesPrice;
            newPrice = newPrice;
        };
    }

    return new class implements Payload {
        code = product.code;
        name = product.name;
        price = product.salesPrice;
        newPrice = newPrice;
        error = result.message;
    };
}

const parseErrorReturn = (code: string, message: string) => {
    return new class implements Payload {
        code = code;
        name = "";
        price = 0;
        newPrice = 0;
        error = message;
    };
}

export {productRouter};