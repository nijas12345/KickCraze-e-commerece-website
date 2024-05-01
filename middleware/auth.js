const passport = require("passport")
const  GoogleStrategy = require('passport-google-oauth2').Strategy;

const GOOGLE_CLIENT_ID = "1091930843837-acj72867ufc24fg2j38inf1cpc56tlc6.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://www.kickzone.online/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    
      return done(null, profile);
    }
  
));

passport.serializeUser(function(user,done){
    done(null,user)
})

passport.deserializeUser(function(user,done){
    done(null,user)
})