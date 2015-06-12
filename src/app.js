new Vue({
    el: '#app',
    data: {
        users : {
            one: {
                id: '',
                nickname: '',
                name: '',
                avatar: '',
                repos: {},
                stars: '',
                countStars: 0,
            },
            two: {
                id: '',
                nickname: '',
                name: '',
                avatar: '',
                repos: {},
                countStars: 0,
            },
        },
        owner: 'marcosrjjunior',
        repos: [],
        error: null,
        // requiredUsers: false,
        submittedOne: false,
        submittedTwo: false,
        userWin: {
            nickname: '',
            message: '',
        },
        ok: false,
        auth: '?client_id=ace1e165828b4adf6528&client_secret=9f26b3f14aa536fed70596cdb8ccb1448014dd17',
    },

    computed: {
        requiredOne: function() {
            if ( ! this.users.one.nickname) return true;
            return false;
        },
        requiredTwo: function() {
            if ( ! this.users.two.nickname) return true;
            return false;
        },
        requiredUsers: function() {
            if (this.users.one.id != 0 && this.users.two.id != 0) return false;
            return true;
            // set: function (param) {
            //     return false;
            //     // this.requiredUsers = param
            // },
        },
    },

    methods: {
        fight: function(e) {
            // $('.users').addClass('shake')

            if (this.isOwner()) return this.finish();

            else if (this.users.one.countStars > this.users.two.countStars)
            {
                this.userWin.nickname = '@'+this.users.one.nickname
                return this.finish();
            }

            this.userWin.nickname = '@'+this.users.two.nickname
            return this.finish();
        },

        isOwner: function() {
            if (this.users.one.nickname == this.owner || this.users.two.nickname == this.owner)
            {
                this.userWin.nickname = this.owner
                this.userWin.message = "Doesn't matter " + this.owner + " is more sexy!"
                return true;
            }
        },

        finish: function() {
            // $('.users').removeClass('shake');

            if ( ! this.userWin.message)
            {
                this.userWin.message = 'User ' + this.userWin.nickname + ' Win!'
            }

            var xhr = $.get("http://api.giphy.com/v1/gifs/random?&api_key=dc6zaTOxFJmzC&tag=fight");

            $('.fight').remove();
            $('.fa-close').remove();

            xhr.done(function(data) {
                $('.giphy').append('<img src="'+data.data.image_original_url+'">');
            });
            this.ok = true
        },

        removeUser: function(user) {
            // this.computed.required(false)
            if (user == 'one')
            {
                this.submittedOne = false;
                this.users.one.id = 0;
            }
            else
            {
                this.submittedTwo = false;
                this.users.two.id = 0;
            }
        },

        getUser: function(user) {

            if (this.validations(user)) return;

            this.$http.get('https://api.github.com/users/' + this.users[user].nickname + this.auth, function (data, status, request) {
                this.users[user].avatar = data.avatar_url;
                this.users[user].name = data.name;
                this.users[user].id = data.id;
                (user == 'one') ? this.submittedOne = true : this.submittedTwo = true;

                this.getRepos(user);
            })
            .error(function (data, status, request) {
                this.error("User doesn't exist");
                this.users[user].nickname = ''
            })
        },

        getRepos: function(user) {
            countStars = 0

            this.$http.get('https://api.github.com/users/' + this.users[user].nickname + '/repos' + this.auth, function (data, status, request) {
                repos = data
                    .filter(function(repo) {
                        return repo.fork === false;
                    })
                    .map(function(repo) {
                        countStars += +repo.stargazers_count
                        return {
                            'id': repo.id,
                            'name': repo.name,
                            'description': repo.description,
                            'stars': +repo.stargazers_count,
                            'forks': +repo.forks_count,
                            'language': repo.language,
                            'url': repo.html_url,
                        }
                    });

                    this.users[user].countStars = countStars;
                    this.users[user].repos = repos;
            })
            .error(function (data, status, request) {
                this.error('Error get repositories');
                return false;
            })
        },

        validations: function(user) {
            if (this.users.one.nickname == this.users.two.nickname)
            {
                this.error('Please, use different user');
                return true;
            }

            else if (this.users[user].nickname.length == 0)
            {
                this.error('Please, add user');
                return true;
            }
        },

        error: function(msg) {
            return alert(msg);
        },
    }

});

// Sort descending star
// Set computed parm
