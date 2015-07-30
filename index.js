var request = require("request");
var ServeMe = require("serve-me");

var server = ServeMe({
  debug: true,
  home: "/manifest.json"
});

server.get("/api/coverage", function(req, next) {
  closedIssues(function(closed) {
    allIssues(function(all) {
      next("" + (closed / all * 100));
    });
  });
});

server.get("/api/open-issues", function(req, next) {
  openIssues(function(count) {
    next("" + count);
  });
});

server.get("/api/closed-issues", function(req, next) {
  closedIssues(function(count) {
    next("" + count);
  });
});


server.get("/api/activity", function(req, next) {
  request({
    url: "https://api.github.com/repos/thewildboard/wildboard/stats/commit_activity",
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
    next("" + (total / count));
  });
});

server.start(7654);



function openIssues(fn) {
  request({
    url: "https://api.github.com/repos/thewildboard/wildboard/issues?per_page=200&state=open",
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

function closedIssues(fn) {
  request({
    url: "https://api.github.com/repos/thewildboard/wildboard/issues?per_page=200&state=closed",
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

function allIssues(fn) {
  request({
    url: "https://api.github.com/repos/thewildboard/wildboard/issues?per_page=200&state=all",
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