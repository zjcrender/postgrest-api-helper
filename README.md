# Welcome to postgrest-api-helper 👋
[![Version](https://img.shields.io/npm/v/postgrest-api-helper.svg)](https://www.npmjs.com/package/postgrest-api-helper)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](doc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> 优雅的生成postgrest查询语句

### 🏠 [Homepage](https://github.com/zjcrender/postgrest-api-helper)

## 依赖库
- [axios](https://github.com/axios/axios)

## 安装

```sh
yarn add postgrest-api-helper
```

## 简要示例

```javascript
import axios from 'axios'
import PGHelper, { not, and, or, eq, gt, like } from 'postgrest-api-helper';

const axiosInstance = axios.create({ /*axios config*/ });
const helper = new PGHelper(axiosInstance);

helper
  .post('path/to/endpoint')
  .setQueries({ key: 'some value' }) // search params
  .setBody({}) // request body
  .select('*', 'table(*)')
  .order('key1', 'key2')
  .like('key', 'searchKey:queryKey|%v*')
  .eq('somekey')
  .not.gt('somekey')
  .and(
    not.or( gt('somekey') ),
    like('somekey', 'somekey')
  )
  .pagination(1, 20, true)
  .then(result => {
      // [ AxiosError, null ] or [ null, AxiosResponse ]
      const [error, response] = result;
      if (!error) {
        // do sth...
      }
   })

```

## helperInstance Apis
### 创建实例
constructor(axiosInstance: AxiosInstance): helperInstance
```javascript
const axiosInstance = axios.create({});
const helper = new PGHelper(axiosInstance)
```

### 请求方法
request(config: AxiosRequestConfig): apiInstance
####  请求方法别名
`get`, `delete`, `head`, `options`, `post`, `put`, `patch`  
(endpoint: string): apiInstance


```javascript
helper.request({
  method: 'get',
  url: 'path/to/endpoint'
})

helper.get('path/to/endpoint')
helper.patch('path/to/endpoint')
// ...
```

## apiInstance Apis
### setQueries(queries: object): apiInstance
设置搜索参数来源
```javascript
api.setQueries({ name: 'Bob', age: 26 })
```

### setBody(queries: any): apiInstance
设置请求body
```javascript
helper
  .post('endpoint')
  .setBody({ id: 'some-id', age: 27 })
```

### addHeader(key: string, value: string): apiInstance
添加一个请求头
```javascript
api.addHeader('authorization', 'bearer some-token')
```

### removeHeader(key: string): apiInstance
删除某个请求头
```javascript
api.removeHeader('authorization')
```

### order
order(key: string, ascending: boolean, nullsfirst: boolean): apiInstance;  
order(...args: string[]): apiInstance;
```javascript
// 单一排序
api.order('name', true, true)
// ?order=name.asc.nullsfirst

// 多重排序
api.order('name', 'age.desc', 'id')
// ?order=name,age.desc,id
```

### select(...args: string[]): apiInstance
设置返回字段
```javascript
api.select('*', 'table(name, age)')
// ?select=*,table(name,age)
```

### pagination(pageIndex: number, pageSize: number, fetchCount?: boolean): apiInstance
设置分页信息:
- pageIndex: 页数, 
- pageSize: 每页条数, 默认为10
- fetchCount: 是否获取总数, 默认为false
```javascript
api.pagination(1, 10, true)
```

### 单操作符
`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `is`, `cs`, `cd`  
(...args: string[]): apiInstance   
支持的字符串模板： `a:b|c` 
- a: searchKey, 生成的搜索url的key
- b: queryKey, Queries的key，值的来源
- c: format, 格式化值，使用%v
```javascript
api
  .setQueries({ name: 'Bob', nl: 20, fs: 90 })
  .like('name|%v*')
  .eq('age:nl')
  .not.lt('score:fs')

// ?name=like.Bob*&age=eq.20&score=not.lt.90
```

### 组合操作符
`and`, `or`  
(...args: Array< string | operator方法 >): apiInstance
```javascript
api
  .setQueries({ name: 'Bob', age: 20, score: 90 })
  .not.and(
    'class.is.1',
    gt('age'), 
    ilike('name'),
    or(
      lte('score')
    )
  )

// ?not.and=(class.is.1,age.gt.20,name.ilike.*Bob*,or(score.lte.90))
```

## 注意
当在组合操作符中使用`in`时，因`in`是JavaScript关键字故改为`_in`
```javascript
import { like, _in } from 'postgrest-api-helper'

api
  .setQueries({ name: 'Bob', id: '1,2,3' })
  .and(
    like('name'),
    _in('id')
  )

// ?and=(name.like.*Bob*,id.in(1,2,3))
```

## 作者

👤 **render**

* Website: https://render.ink
* Github: [@zjcrender](https://github.com/zjcrender)
