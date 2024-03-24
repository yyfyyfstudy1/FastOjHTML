# FastOJ-frontend

## Project installation and deployment

### 1. Install project dependencies

```bash
npm install
#
yarn
```

Dependencies/plug-ins used in this project (no need to execute)

```bash
# Component library
yarn add --dev @arco-design/web-vue
# Axios 工具
yarn add axios
# MarkDown editor dependencies
yarn add @bytemd/vue-next
yarn add bytemd
yarn add @bytemd/plugin-math @bytemd/plugin-highlight @bytemd/plugin-gfm
yarn add highlight.js # code highlighting

# code editor
yarn add monaco-editor
# Integrate webpack and text editor for easy packaging and installation
yarn add monaco-editor-webpack-plugin
```

### Get the backend code interface

```
openapi --input http://localhost:8104/api//v2/api-docs --output ./backapi --client axios
```

### 2. Project construction

```bash
yarn build
```

### 3. Production environment operation

```
yarn serve
```

### repair file

```
yarn lint
```
