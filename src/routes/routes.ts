import {Request, Response, Router} from 'express'
const router = Router()

router.get('/hello', (_request: Request, response: Response) => {
  return response.status(200).send({ hello: 'world'})
})

export { router }