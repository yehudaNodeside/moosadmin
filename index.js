//schema.paths and schema.trees

var Models = {};

var express = require('express');

var path = require('path')

module.exports = function(mongoose) {



	var app = express();

	app.listen(3006);

	console.log('listening on 3006')

	app.use('/', require('./routes')(Models));

	app.use(express.static(path.join(__dirname,'public')));

	var models = mongoose.models;

	//console.log(models)


	for (var model in models) {

		var paths = models[model].schema.paths


		Models[model] = Models[model] || {
			fields: {}
		};


		Models[model].totalFields = 0;

		for (var field in paths) {
			// console.log(field)


			Models[model].totalFields++;
			var inner = paths[field]


			var refType = '';

			//console.log(inner)
			if (inner.options.type && inner.options.type.schemaName === 'ObjectId' && inner.options.ref) {
				refType = inner.options.ref;
			}

			// console.log(inner)
			var dataType = Object.getPrototypeOf(inner).constructor.schemaName;
			//console.log(model+': '+field+': '+dataType + ' '+refType + ' Instance: ' +inner.instance+ ' Enum: '+inner.enumValues);

			Models[model].fields[field] = {
				// model: model,
				field: field,
				dataType: dataType,
				refType: refType,
				instance: inner.instance,
				enumValues: inner.enumValues || []
			}

			//switch 

		}

		for (var model in Models) {

			loadModel(model);

			function loadModel(model) {

				app.get('/' + model + '/:id?', function(req, res, next) {


					var Model = mongoose.model(model);


					var Query = Model.find({}, {});

					if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) {
						Query.where('_id', req.params.id);
					}

					var limit = 100;
					var skip = 0;

					if (req.query.limit && !isNaN(req.query.limit)) {
						limit = parseInt(req.query.limit);
					}

					if (req.query.skip && !isNaN(req.query.skip)) {
						skip = parseInt(req.query.skip);
					}


					Query.limit(limit).skip(skip);

					if (req.query.sort) {
						var sort = {}
						var validSortValues = ['1','-1','asc','desc','ascending','descending']
						req.query.order = req.query.order || -1;

						if (validSortValues.indexOf(req.query.order) === -1) {
							req.query.order = -1;
						}

						sort[req.query.sort] = req.query.order;

						Query.sort(sort);

					}



					Query.exec(function(err, docs) {

						if (err) {
							return next(err);
						}

						res.send(docs);
					})
				});
			}

		}


	}



	//console.log(Models)
}



// for (var index in models) {
// 	console.log(index)

// 	console.log(models[index].schema.tree)
// }