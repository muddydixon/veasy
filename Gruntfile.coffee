module.exports = (grunt)->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      options:
        bare: true
      src:
        files:
          "lib/d3chart.js": "src/d3chart.coffee"
      test:
        files:
          "test/d3chart.js": [
            "test/header.coffee"
            "test/*_test.coffee"
            "test/footer.coffee"
            ]
          
    watch:
      src: 
        files: ["src/d3chart.coffee"]
        tasks: ["coffee"]
      test:
        files: ["test/*_test.coffee"]
        tasks: ["coffee"]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "default", ["coffee"]
        
    