// import ForumsService
const Forum = require('../models/Forum');
const { Router } = require('express');

class ForumsController {
  constructor() {
    this.router = Router();

    this.router.get('/', this.get);
    this.router.post('/', this.post);

    // this.router.get('/:id', this.controller.get);
    // this.router.put('/:id', this.put);
    // this.router.delete('/:id', this.delete);
  }

  get = async (req, res) => {
    const defaultFilters = {
      page: 1,
      pageSize: 15,
      name: '',
      author: '',
      size: 'medium',
    };
    const response = [
      {
        id: 2,
        name: 'Mockie forum',
        author: 'GALV',
        description: 'This is a mock forum for test',
        imageSrc: null,
        lastActivity: new Date(), // calculate from actions done on forum/topic
        participants: [
          {
            id: 'idasdads',
            username: 'ticky01',
          },
          {
            id: 'idwasdfgh',
            username: 'yayis01',
          },
        ],
        topics: [
          {
            id: 'idzxcvbn',
            name: 'First fake topic',
          },
          {
            id: 'idqwerty',
            name: 'Another fake topic',
          },
          {
            id: 'idasdfg',
            name: 'Last fake topic',
          },
        ],
      },
      {
        id: 3,
        name: 'Other forum',
        author: 'GALV',
        description: 'This is other mock forum for testing',
        imageSrc: null,
        participants: [],
        topics: ['Only me'],
        lastActivity: new Date(),
      },
    ];
    return res.status(200).json({ payload: response });
  };

  post = async (req, res) => {
    const forum = req.body;
    const result = await new Forum(forum).save();
    return res.status(201).json(result);
  };
}

module.exports = ForumsController;
