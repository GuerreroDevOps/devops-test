// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const mysql = require("mysql-await");
let response;

// Load the AWS SDK
var AWS = require('aws-sdk'),
    region = "us-east-1",
    stage = process.env.STAGE,
    secret,
    decodedBinarySecret;
var secretsmanager = new AWS.SecretsManager();

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        // const ret = await axios(url);

        // Leer secreto que se configuro en template.yaml
        const data = await secretsmanager.getSecretValue({SecretId: process.env.RDS_MYSQL_SECRET}).promise();
        // Convertir el json en objeto para pasarlo a la conexión
        secret = data.SecretString;
        var obj = JSON.parse(secret);
        
        // Mapear datos en la variable configMysql para enviarlo a la conexión
        let configMysql = {
            connectionLimit : 1000,
            connectTimeout  : 60 * 60 * 1000,
            acquireTimeout  : 60 * 60 * 1000,
            timeout         : 60 * 60 * 1000,
            host: obj.host,
            user: obj.username,
            database: obj.dbname, // pensionesDB?useUnicode=true&characterEncoding=utf-8&useSSL=false
            password: obj.password,
            port: obj.port
        };

        // Se crea el pool de conexiones y se deja en wait
        const pool = await mysql.createPool(configMysql);
        const connection = await pool.awaitGetConnection();

        // Se captura la fecha para guardar los datos
        let hoy = new Date();
        let nowDate = await formatoFecha(hoy, 'dd-mm-yy');
        console.log('La fecha actual es',nowDate);

        let s3BucketDate = "";

        // Se revisa el ambiente para apuntar al bucket de acuerdo al stage
        if (stage == "TEST")
            s3BucketDate = "users-test/";
        if (stage == "PROD")
            s3BucketDate = "users-prod/";
        
        // Se realiza el consumo a la base de datos y se guarda en el S3 directamente.
        let newQueryPP = await connection.awaitQuery(`SELECT 'ID', 'DATE', 'TYPE', 'NAME', 'SURNAME'
        UNION ALL 
        SELECT ID, DATE, TYPE, NAME, SURNAME
        FROM USERS INTO OUTFILE S3 's3://`+s3BucketDate+`users/`+nowDate+`.csv' 
        FIELDS TERMINATED BY '|' 
        LINES TERMINATED BY '\n'
        OVERWRITE ON;`);

        // Se cierran las conexiones abiertas
        await connection.release();

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'api app',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
