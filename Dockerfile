# 郑大集市 - Docker 镜像构建文件
# 用于腾讯云 CloudBase Cloud Run 部署

# ============ 构建阶段 ============
FROM node:18-alpine AS build
WORKDIR /app

# 安装后端依赖
COPY server/package*.json ./server/
RUN cd server && npm install --production=false

# 安装前端依赖
COPY client/package*.json ./client/
RUN cd client && npm install

# 复制源码
COPY server/ ./server/
COPY client/ ./client/

# 构建前端
RUN cd client && npm run build

# 编译后端 TypeScript
RUN cd server && npx tsc

# 复制前端构建产物到后端 public 目录
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# ============ 运行阶段 ============
FROM node:18-alpine
WORKDIR /app

# 仅复制运行所需文件
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/node_modules ./node_modules
COPY --from=build /app/server/public ./public
COPY --from=build /app/server/package.json ./package.json

# 创建上传目录
RUN mkdir -p uploads

# CloudBase 会自动设置 PORT 环境变量
ENV PORT=3001
EXPOSE 3001

# 环境变量说明（在 CloudBase 控制台设置）:
# MONGODB_URI - MongoDB Atlas 连接字符串（必填）
# JWT_SECRET  - JWT 签名密钥（建议设置）

CMD ["node", "dist/index.js"]
