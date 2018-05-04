const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tiruchengode');
module.export = {mongoose};