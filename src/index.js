import mongoose from 'mongoose';
import app from './app';

mongoose.connect('mongodb://database/heligram', {
  useNewUrlParser: true,
});

app.listen(process.env.PORT || 3000, () => {
  console.log('App running at http://localhost:3000');
});
