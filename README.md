# **devops-test**

Este projecto contiene codigo y archivos de soporte para una aplicación serverless que se despliega con SAM CLI y una infraestructura con cloudformation.

**Documentación de AWS**

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-reference.html#serverless-sam-cli

https://docs.aws.amazon.com/es_es/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Integrating.SaveIntoS3.html

**Estructura de Carpetas:**
- coding/* - Codigo de las aplicaciones Funciones Lambda.
- coding/*/tests - Pruebas unitarias que se definen dentro de cada aplicación.
- template.yaml - Template que define los recursos de las aplicaciones.
- codepipeline.yaml - Template que define los stages del pipeline.

**Estructura del Proyecto:**

<img src="https://github.com/GuerreroDevOps/devops-test/raw/main/images/architecture-01.png" width="400" alt="DevOps Arquitecture">

## Deploy the application

Se configurar 2 ambientes (Sandbox y Production) y se deja con la practica de desarrollo basado en troncos.

* Node.js - [Install Node.js 14](https://nodejs.org/en/), Incluye los paquetes de NPM.

Para construir el proyecto con una imagen de Docker con el Dockerfile que se encuentra dentro de cada aplication.
```bash
sam build

sam deploy -t codepipeline.yaml --stack-name devops-test-pipeline --capabilities=CAPABILITY_IAM
```

<img src="https://github.com/GuerreroDevOps/devops-test/raw/main/images/pipe-01.png" width="400" alt="DevOps Pipe 1">

<img src="https://github.com/GuerreroDevOps/devops-test/raw/main/images/pipe-02.png" width="400" alt="DevOps Pipe 2">

Cuando se ejecute el pipeline va a solicitar la conexion a Github y se debe aprobar.

<img src="https://github.com/GuerreroDevOps/devops-test/raw/main/images/conexion-01.png" width="400" alt="DevOps Conexion 1">

## Use the SAM CLI to build and test locally

Construir la aplicación con el comando `sam build`.

```bash
devops-test$ sam build
```

SAM CLI construye una imagen docker con el Dockerfile e instala las dependencias definidas en el package dentro de cada aplicación.

Ejecuta pruebas locales invocando el comando `sam local invoke`.

```bash
devops-test$ sam local invoke HelloWorldFunction --event events/event.json
```

SAM CLI puede emular tu aplicación usando el comando `sam local start-api` puedes correr la aplicación en el puerto 3000.

```bash
devops-test$ sam local start-api
devops-test$ curl http://localhost:3000/
```

SAM CLI lee la configuración de las aplicaciones del archivo template.yaml para determinar las rutas de la función.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Unit tests

Las pruebas son definidas dentro de cada proyecto en `coding/*/tests` Use npm install para las dependencias.

```bash
devops-test$ cd coding/api-app/
hello-world$ npm install
hello-world$ npm run test
```