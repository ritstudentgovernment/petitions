![Homepage](../screenshots/screenshots/homepage.png?raw=true "Home Page")

About
=====

PawPrints is a web application for sparking change at RIT. Share ideas and influence decision making by posting petitions. The community expresses support for petitions by adding signatures. Once a minimum signature threshold is reached, notifications are dispatched to members of Student Government. As an issue evolves, SG posts incremental status updates. Once a final decision is made, a response is issued by either an SG representative or a member of the administration, or both. PawPrints is built using Meteor v1.0.

Usage (Local Development)
=========================

- Install [Meteor].
- Copy `settings.json.sample` to `settings.json` and edit appropriately. All properties defined in `settings.json.sample` are required.
- From the root directory, run `meteor --settings settings.json`.

Usage (Production Environment)
==============================

- Check out the node section of the [config] repository for example systemd files and nginx configuration files.
- For creating an admin user for mongo, read Section 1.2 of this [article].

Contributing
============

- The [roadmap] details planned features by core project maintainers.
- We are open to pull requests! Please follow the coding conventions currently in place.


[Node]:http://nodejs.org/
[Meteor]:https://www.meteor.com/
[roadmap]:https://trello.com/b/b6Kyx395/petition-roadmap
[config]:https://github.com/ritstudentgovernment/config
[article]:https://gentlenode.com/journal/meteor-1-deploy-and-manage-a-meteor-application-on-ubuntu-with-nginx/1
