var fs = require('fs')
var path = require('path')
var Handlebars = require('handlebars')
var moment = require('moment')
var pluralize = require('pluralize')

function render (resume) {
  var css = fs.readFileSync(path.join(__dirname, '/style.css'), 'utf-8')
  var tpl = fs.readFileSync(path.join(__dirname, '/resume.hbs'), 'utf-8')
  var partialsDir = path.join(__dirname, 'partials')
  var filenames = fs.readdirSync(partialsDir)

  Handlebars.registerHelper({
    trim: function(str) {
      return str.trim();
    },
    replaceFirst: function(str, toBeReplaced, b) {
      return str.split(toBeReplaced).join(b);
    },
    startsWith: function(prefix, str, options) {
      return (str.indexOf(prefix) === 0) ? options.fn(this) : options.inverse(this)
    },
    ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this)
    },
    formatDate: function (date) {
      if (typeof date === 'undefined') {
        return 'now'
      }
      return moment(date).format('MMM YYYY')
    },
    formatDateYear: function (date) {
      if (typeof date === 'undefined') {
        return 'now'
      }
      return moment(date).format('YYYY')
    },
    networkIcon: function (network) {
      if (network === 'StackOverflow') {
        return 'stack-overflow'
      } else {
        return network.toLowerCase()
      }
    },
    wordWrap: function (str) {
      str = str.replace(/\//g, "/ ");
      return str.replace("/ / ", "//");
    },
    dateDiff: function (startDate, endDate) {
      let text = ''
      startDate = moment(startDate)
      if (endDate === null || endDate === '' || endDate === undefined) {
        endDate = moment()
      } else {
        endDate = moment(endDate)
      }
      let years = endDate.diff(startDate, 'years')
      startDate.add(years, 'years')
      let months = endDate.diff(startDate, 'months')

      if (years > 0) {
        text += `${years} ${pluralize('years', years)}`
      }
      if (months > 0) {
        if (years > 0) {
          text += ' '
        }
        text += `${months} ${pluralize('months', months)}`
      }

      return text
    },
    parseWorkText: function (str) {
      if(str.lastIndexOf("[") == -1) {
        return str
      }
      var text = str.substring(0, str.lastIndexOf("[") - 1)
        return text.trim()
      },
    parseWorkTech: function (str) {
      if(str.lastIndexOf("[") == -1) {
        return ''
      }
      let text = ''
      let content = str.substring(
      str.lastIndexOf("[") + 1, 
      str.lastIndexOf("]"))
      let tech = content.split(',')
      for (i = 0; i < tech.length; i++) {
        text += '<span class=\'label label-default\'>' + tech[i].trim() + '</span>'
      }
      return text
    }
  })

  filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename)
    if (!matches) {
      return
    }
    var name = matches[1]
    var filepath = path.join(partialsDir, filename)
    var template = fs.readFileSync(filepath, 'utf8')

    Handlebars.registerPartial(name, template)
  })
  return Handlebars.compile(tpl)({
    css: css,
    resume: resume
  })
}

function exportPdf (resumeFile, pageFormat) {
  let resume = require(path.join(__dirname, resumeFile))
  const pdf = require('html-pdf')
  const template = render(resume, pageFormat)

  pdf.create(template, {format: pageFormat}).toFile('./resume.pdf', function (err, res) {
    if (err) return console.log(err)
  })
}

module.exports = {
  render: render,
  exportPdf: exportPdf,
	pdfRenderOptions: {
		format: 'A4',
		//mediaType: 'print',
		pdfViewport: { width: 1920, height: 1280 },
		margin: {
			top: '0.0in',
			bottom: '0.0in',
			left: '0.0in',
			right: '0.0in',
		},
	}
}
