import { dbStorage } from './../store/store';
import * as express from 'express';

const app = express();

app.use(express.static('public'));
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/reports/:id', async (req, res) => res.json(await dbStorage(req.params.id).all()));

export const listen = (port: number) => {
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
