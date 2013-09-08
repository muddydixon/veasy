module.exports = (grunt)->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      options:
        bare: true
      src:
        files:
          "lib/veasy.js": "src/veasy.coffee"
      test:
        files:
          "test/veasy.js": [
            "test/header.coffee"
            "test/*_test.coffee"
            "test/footer.coffee"
            ]

    watch:
      src:
        files: ["src/veasy.coffee"]
        tasks: ["coffee"]
      test:
        files: ["test/*_test.coffee", "Gruntfile.coffee"]
        tasks: ["coffee"]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "default", ["coffee"]
