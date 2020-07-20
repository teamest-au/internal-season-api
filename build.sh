npx grpc_tools_node_protoc\
  --plugin="protoc-gen-ts=node_modules/.bin/protoc-gen-ts" \
  --plugin="protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin" \
  --proto_path=proto \
  --ts_out=service=grpc-node:client \
  --js_out=import_style=commonjs,binary:client \
  --grpc_out=grpc_js:client proto/season.proto;

cd client;

rm -rf dist
mkdir dist

sed -i -- 's/import \* as grpc from "grpc";/import \* as grpc from "@grpc\/grpc-js";/g' *.d.ts

npm run build

cp *.d.ts dist
cp *.js dist
