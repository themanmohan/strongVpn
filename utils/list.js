const ObjectId = require('mongoose').Types.ObjectId;
const { api } = require(".");

const convertString = value => {
  const splitCode = value.split('_');
  let convert = splitCode.map(item => {
    return item.charAt(0).toUpperCase() + item.slice(1);
  });
  return convert.join(' ');
}

const utils = {
  makeSort: req => {
    if (req.sort) {
      return req.sort.join(' ');
    }

    return '-created_at';
  },
  makeSearch: req => {
    if (req.search) {
      if (req.search_by === '_id' || req.search_by === 'id') {
        return {
          [req.search_by]: ObjectId.isValid(req.search) ? new ObjectId(req.search) : null
        };
      }

      console.log({
        [req.search_by]: new RegExp(`${req.search}`, 'i')
      })

      return {
        [req.search_by]: new RegExp(`${req.search}`, 'i')
      };
    }

    return {}

  },
  purify: (req, fieldsAcceptToShow = []) => {
    let purify = {};
    const queries = Object.keys(req.query || {}) ? Object.keys(req.query) : []
    for (let query of queries) {
      if (fieldsAcceptToShow.includes(query) && req.query && req.query[query]) {
        purify = {
          ...purify,
          [query]: req.query[query]
        }
      }
    }

    return purify
  },
  get: ({ model, req, res, next }) => {
    const relation = req?.relation || []
    const fieldsAcceptToShow = Object.keys(model.schema.paths)

    return model.find(
      {
        ...utils.makeSearch(req),
        ...utils.purify(req, fieldsAcceptToShow),
      },
      (err, result) => {
        if (err) {
          return api.error({ res });
        } else {
          model.countDocuments(
            {
              ...utils.makeSearch(req),
              ...utils.purify(req, fieldsAcceptToShow),
            },
            (err, count) => {
              if (err) {
                return api.error({ res });
              }

              return api.ok({
                res, data: {
                  rows: result,
                  meta: {
                    page: req.skip,
                    per_page: req.limit,
                    total: count,
                    total_page: Math.ceil(count / req.limit)
                  } 
                }
              });
            }
          );
        }
      }
    )
      .skip(Number((req.skip - 1) * req.limit))
      .limit(Number(req.limit))
      .sort(utils.makeSort(req))
      .populate(relation)
  }
}

exports.filter = (req, res, next) => {
  req.search = req.query.search ? req.query.search : '';
  req.search_by = req.query.search_by ? req.query.search_by : 'name';

  next();
}

exports.pagination = (req, _res, next) => {
  req.skip = req.query.page ? req.query.page : 1;
  req.limit = req.query.limit ? req.query.limit : 10;

  next();
}

exports.listview = utils