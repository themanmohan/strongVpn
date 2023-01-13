module.exports = {
    apps : [
        {
          name: "Victor-API",
          script: "index.js",
          watch: true,
          error_file : "../log/err.log",
          out_file : "../log/out.log",
          env: {
              "PORT": 3003,
              "HOST": "localhost",
              "NODE_ENV": "production",
              "DATABASE_HOST": "127.0.0.1",
              "DATABASE_SRV": false,
              "DATABASE_PORT": 27017,
              "DATABASE_NAME": "victor_strongvpn",
              "DATABASE_USERNAME": "",
              "DATABASE_PASSWORD": '',
              "AUTHENTICATION_DATABASE": "",
              "SECRET_KEY": "2it5RackERaPP!@#"
          }
        }
    ]
  }
