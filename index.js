var request = require("request");
var ServeMe = require("serve-me");

var server = ServeMe({
  debug: true,
  home: "/manifest.json"
});

server.get("/:user/:repo/coverage", function(req, next) {
  var user = req.params.user,
    repo = req.params.repo;

  closedIssues(user, repo, function(closed) {
    allIssues(user, repo, function(all) {
      if (!closed || !all || all == 0) {
        next("0");
      } else {
        next("" + (closed / all * 100));
      }
    });
  });
})

.get("/:user/:repo/open-issues", function(req, next) {
  var user = req.params.user,
    repo = req.params.repo;

  openIssues(user, repo, function(count) {
    if (!count) {
      next("0");
    } else {
      next("" + count);
    }
  });
})

.get("/:user/:repo/closed-issues", function(req, next) {
  var user = req.params.user,
    repo = req.params.repo;

  closedIssues(user, repo, function(count) {
    if (!count) {
      next("0");
    } else {
      next("" + count);
    }
  });
})

.get("/:user/:repo/activity", function(req, next) {
  var user = req.params.user,
    repo = req.params.repo;

  request({
    url: "https://api.github.com/repos/" + user + "/" + repo + "/stats/commit_activity",
    headers: {
      'user-agent': 'node.js'
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error) // Show the HTML for the Google homepage.
      next("0");
      return;
    }
    var weeks = JSON.parse(body);
    var count = 0;
    var total = 0;

    for (var i = 0; i < weeks.length; i++) {
      var weekTotal = weeks[i].total;
      if (weekTotal != 0) {
        count++;
        total += weekTotal;
      }
    }

    if (!total || !count || count == 0) {
      next("0");
    } else {
      next("" + (total / count));
    }
  });
});

server.start(7654);



function openIssues(user, repo, fn) {
  request({
    url: "https://api.github.com/repos/" + user + "/" + repo + "/issues?per_page=200&state=open",
    headers: {
      'user-agent': 'node.js'
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error); // Show the HTML for the Google homepage.
      fn(-1);
      return;
    }
    var open = JSON.parse(body);
    fn(open.length);
  });
}

function closedIssues(user, repo, fn) {
  request({
    url: "https://api.github.com/repos/" + user + "/" + repo + "/issues?per_page=200&state=closed",
    headers: {
      'user-agent': 'node.js'
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error); // Show the HTML for the Google homepage.
      fn(-1);
      return;
    }
    var closed = JSON.parse(body);
    fn(closed.length);
  });
}

function allIssues(user, repo, fn) {
  request({
    url: "https://api.github.com/repos/" + user + "/" + repo + "/issues?per_page=200&state=all",
    headers: {
      'user-agent': 'node.js'
    }
  }, function(error, response, body) {
    if (error) {
      console.log(error); // Show the HTML for the Google homepage.
      fn(-1);
      return;
    }
    var all = JSON.parse(body);
    fn(all.length);
  });
}