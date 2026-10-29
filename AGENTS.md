# AGENTS.md

## 接口文档

各后端服务的接口文档统一存放在 `docs/api` 目录下，服务名与请求前缀的对应关系如下：

| 服务名 | 请求前缀 |
|---|---|
| media-service | /ms |
| auth-service | /as |
| data-service | /ds |
| message-service（WebSocket） | /sms/ws |
| message-service | /sms |
| user-service | /us |
| course-service | /cs |
| order-service | /os |
| search-service | /ss |
| learning-service | /ls |
| pay-service | /ps |
| trade-service | /ts |
| exam-service | /es |
| remark-service | /rs |
| promotion-service | /prs |
| live-service | /lv |
| chat-service | /ct |

## 注意事项

- 查阅接口文档时，请以文档内容为准，不要推测文档中未明确说明的内容。
- 如果所需接口在对应服务的文档中缺失（包括但不限于接口定义、参数说明等），请立即暂停当前任务并告知用户，不要继续推进。

## 其他

- `tj-protal` 的 TypeScript 重构计划见 `tj-protal/docs/ts-migrate-plan.md`。