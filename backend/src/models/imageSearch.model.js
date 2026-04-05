var db  = require('../config/db');
var path  = require('path');

let buildImageSearchQueryData = ({ description = '', category_id, file, protocol, host, page, limit }) => {
  let offset = (page - 1) * limit;

  let imageUrl = null;
  let searchConditions = [];
  let whereParams = [];
  let relevanceCases = [];
  let scoreParams = [];

  if (file) {
    imageUrl = `${protocol}://${host}/uploads/${file.filename}`;

    let originalNameBase = path.parse(file.originalname).name;
    let nameKeywords = originalNameBase.split(/[-_\s]+/).filter(k => k.length >= 3);

    if (nameKeywords.length > 0) {
      nameKeywords.forEach(kw => {
        searchConditions.push('(p.image_url LIKE ?)');
        whereParams.push(`%${kw}%`);
        relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 50 ELSE 0 END)');
        scoreParams.push(`%${kw}%`);
      });
    } else if (originalNameBase.length >= 3) {
      searchConditions.push('(p.image_url LIKE ?)');
      whereParams.push(`%${originalNameBase}%`);
      relevanceCases.push('(CASE WHEN p.image_url LIKE ? THEN 100 ELSE 0 END)');
      scoreParams.push(`%${originalNameBase}%`);
    }
  }

  if (description.trim()) {
    let phrases = description.split(',').map(p => p.trim()).filter(p => p.length >= 2);

    if (phrases.length > 0) {
      phrases.forEach(() => {
        searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      });

      phrases.forEach(phrase => {
        whereParams.push(`%${phrase}%`, `%${phrase}%`);
        relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 10 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 3 ELSE 0 END)');
        scoreParams.push(`%${phrase}%`, `%${phrase}%`);
      });
    }

    let words = description.replace(/[.,;:]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
    if (words.length > 0) {
      words.forEach(() => {
        searchConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      });

      words.forEach(word => {
        whereParams.push(`%${word}%`, `%${word}%`);
        relevanceCases.push('(CASE WHEN p.name LIKE ? THEN 2 ELSE 0 END) + (CASE WHEN p.description LIKE ? THEN 1 ELSE 0 END)');
        scoreParams.push(`%${word}%`, `%${word}%`);
      });
    }
  }

  if (searchConditions.length === 0) {
    return {
      imageUrl,
      description: description.trim(),
      countQuery: null,
      countParams: [],
      searchQuery: null,
      searchParams: []
    };
  }

  let finalWhere = [`(${searchConditions.join(' OR ')})`];
  let finalWhereParams = [...whereParams];

  if (category_id) {
    finalWhere.push('p.category_id = ?');
    finalWhereParams.push(category_id);
  }

  let finalWhereClause = `WHERE ${finalWhere.join(' AND ')}`;
  let relevanceSelect = relevanceCases.length > 0
    ? `(${relevanceCases.join(' + ')}) as relevance_score`
    : '0 as relevance_score';
  let havingClause = relevanceCases.length > 0 ? 'HAVING relevance_score >= 5' : '';

  let countQuery = havingClause
    ? `
      SELECT COUNT(*) as total FROM (
        SELECT p.id, ${relevanceSelect}
        FROM parts p
        ${finalWhereClause}
        ${havingClause}
      ) as subquery
    `
    : `SELECT COUNT(DISTINCT p.id) as total FROM parts p ${finalWhereClause}`;

  let countParams = havingClause
    ? [...scoreParams, ...finalWhereParams]
    : [...finalWhereParams];

  let searchQuery = `SELECT DISTINCT p.*, c.name as category_name, ${relevanceSelect}
     FROM parts p
     JOIN categories c ON p.category_id = c.id
     ${finalWhereClause}
     ${havingClause}
     ORDER BY relevance_score DESC, p.name ASC
     LIMIT ? OFFSET ?`;

  let searchParams = [...scoreParams, ...finalWhereParams, limit, offset];

  return {
    imageUrl,
    description: description.trim(),
    countQuery,
    countParams,
    searchQuery,
    searchParams
  };
};

let countPartsByImageSearch = async (query, params) => {
  let [rows] = await db.query(query, params);
  return rows[0]?.total || 0;
};

let findPartsByImageSearch = async (query, params) => {
  let [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  buildImageSearchQueryData,
  countPartsByImageSearch,
  findPartsByImageSearch
};
