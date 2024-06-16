# 배포 주소

[배포 주소 바로가기](http://ec2-3-34-196-221.ap-northeast-2.compute.amazonaws.com)
[API 문서 바로가기](http://ec2-3-34-196-221.ap-northeast-2.compute.amazonaws.com/api)

# ERD

![ERD](https://i.imgur.com/lqLn84g.png)

# 프로젝트 구조

```

📦
├─ .dockerignore
├─ .eslintrc.js
├─ .github
│  └─ workflows
│     └─ main.yml
├─ .gitignore
├─ .prettierrc
├─ Dockerfile
├─ README.md
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ common
│  │  ├─ database
│  │  │  ├─ type-orm.config.module.ts
│  │  │  └─ type-orm.config.service.ts
│  │  ├─ decorators
│  │  │  ├─ private.decorator.ts
│  │  │  └─ user-data.decorator.ts
│  │  ├─ errors
│  │  │  ├─ error-code.ts
│  │  │  └─ service-exception.ts
│  │  ├─ filters
│  │  │  └─ grobal-exception.filter.ts
│  │  ├─ interceptors
│  │  │  └─ success-response.interceptor.ts
│  │  ├─ storage
│  │  │  ├─ aws-s3.module.ts
│  │  │  └─ aws-s3.service.ts
│  │  ├─ types
│  │  │  ├─ account.type.ts
│  │  │  ├─ index.ts
│  │  │  └─ response.type.ts
│  │  └─ utils
│  │     └─ response.formatter.ts
│  ├─ domains
│  │  ├─ auth
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.guard.ts
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ dto
│  │  │  │  └─ index.ts
│  │  │  ├─ entities
│  │  │  │  ├─ index.ts
│  │  │  │  └─ refresh-token.entity.ts
│  │  │  ├─ exceptions
│  │  │  │  └─ index.ts
│  │  │  └─ specs
│  │  │     ├─ auth.controller.spec.ts
│  │  │     ├─ auth.guard.spec.ts
│  │  │     └─ auth.service.spec.ts
│  │  ├─ categories
│  │  │  ├─ categories.controller.ts
│  │  │  ├─ categories.module.ts
│  │  │  ├─ categories.service.ts
│  │  │  ├─ dto
│  │  │  │  └─ index.ts
│  │  │  ├─ entities
│  │  │  │  ├─ category.entity.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ exceptions
│  │  │  │  └─ index.ts
│  │  │  └─ specs
│  │  │     ├─ categories.controller.spec.ts
│  │  │     └─ categories.service.spec.ts
│  │  ├─ posts
│  │  │  ├─ comment
│  │  │  │  ├─ dto
│  │  │  │  │  └─ index.ts
│  │  │  │  ├─ specs
│  │  │  │  │  └─ comments.service.spec.ts
│  │  │  │  ├─ comments.module.ts
│  │  │  │  ├─ comments.repository.ts
│  │  │  │  ├─ comments.service.ts
│  │  │  │  └─ entities
│  │  │  │     ├─ comment.entity.ts
│  │  │  │     └─ index.ts
│  │  │  ├─ dto
│  │  │  │  └─ index.ts
│  │  │  ├─ entities
│  │  │  │  ├─ image.entity.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ post.entity.ts
│  │  │  ├─ exceptions
│  │  │  │  └─ index.ts
│  │  │  ├─ posts.controller.ts
│  │  │  ├─ posts.module.ts
│  │  │  ├─ posts.repository.ts
│  │  │  ├─ posts.service.ts
│  │  │  └─ specs
│  │  │     ├─ posts.controller.spec.ts
│  │  │     └─ posts.service.spec.ts
│  │  └─ users
│  │     ├─ dto
│  │     │  └─ index.ts
│  │     ├─ entities
│  │     │  ├─ index.ts
│  │     │  └─ user.entity.ts
│  │     ├─ specs
│  │     │  ├─ users.controller.spec.ts
│  │     │  └─ users.service.spec.ts
│  │     ├─ users.controller.ts
│  │     ├─ users.module.ts
│  │     └─ users.service.ts
│  └─ main.ts
├─ test
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ tsconfig.build.json
└─ tsconfig.json

```
