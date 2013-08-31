* <a href="#H1_1">License</a>
* <a href="#H1_2">Contributing to Source Code</a>
* <a href="#H1_3">Applying Code Standards</a>
* <a href="#H1_4">Checking Out and Building `DaruDar`</a>
* <a href="#H1_5">Submitting Your Changes</a>


<a name="H1_1"></a>
# License

DaruDar front-end is an open source project licensed under the [CC-BY-SA license](http://github.com/darudar/darudar-frontend/blob/master/LICENSE). Your contributions are
always welcome. When working with DaruDar code base, please follow the guidelines provided on
this page.


<a name="H1_2"></a>
# Contributing to Source Code

We'd love for you to contribute to our source code and to make DaruDar even better than it is
today! Here are the guidelines we'd like you to follow:

* Major changes that you intend to contribute to the project should be discussed first on our [mailing list](https://groups.google.com/forum/?hl=en#!forum/darudar) so that we can better
coordinate our efforts, prevent  duplication of work, and help you to craft the change so that it
is successfully accepted upstream.

* Small changes and bug fixes can be crafted and submitted to Github as a <a href="#H1_5">pull
request</a>.



<a name="H1_3"></a>
# Applying Code Standards

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes must be tested by one or more <a href="#unit-tests">specs</a>.

* All public API methods must be documented with ngdoc, an extended version of jsdoc (we added
support for markdown and templating via `@ngdoc` tag). To see how we document our APIs, please
check out the existing ngdocs.

* With the exceptions listed below, we follow the rules contained in [JavaScript Style
Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml Google's):

  * Do not use namespaces: Instead, we wrap the entire `angular` code base in an anonymous closure
and export our API explicitly rather than implicitly.

  * Wrap all code at 100 characters.

  * Instead of complex inheritance hierarchies, we prefer simple objects. We use prototypical
inheritance only when absolutely necessary.

  * We love functions and closures and, whenever possible, prefer them over objects.

  * To write concise code that can be better minified, internally we use aliases that map to the
external API. See our existing code to see what we mean.

  * We don't go crazy with type annotations for private internal APIs of components. The best guidance is to do what makes the most sense.


<a name="H1_4"></a>
# Checking Out and Building DaruDar front-end.

The DaruDar source code is hosted at [Github](http://github.com), which we also use to
accept code contributions. The DaruDar front-end repository can be found at **<https://github.com/darudar/darudar-frontend>**.

Several steps are needed to check out and build DaruDar front-end:

## Installation Dependencies

Before you can build DaruDar front-end, you must install or configure the following dependencies on your
machine:

* Git: The [Github Guide to Installing Git](http://help.github.com/mac-git-installation) is
quite a good source for information on Git.

* [Node.js](http://nodejs.org): We use Node to generate the documentation, run a
development web server, run tests, and generate a build. Depending on your system, you can install Node either from source or as a
pre-packaged bundle.

* [Java](http://www.java.com): JavaScript is minified using
[Closure Tools](https://developers.google.com/closure/) jar. Make sure you have Java (version 6 or higher) installed
and included in your [PATH](http://docs.oracle.com/javase/tutorial/essential/environment/paths.html) variable.

* [Grunt](http://gruntjs.com): We use Grunt as our build system. Install the grunt command-line tool globally with:

  * `sudo npm install -g grunt-cli`
  
  
* [Bower](http://bower.io/): Bower is used to manage packages. Install the bower tool globally with:

  * `sudo npm install -g bower`
  
## Creating a Github Account and Forking DaruDar

To create a Github account, follow the instructions [here](https://github.com/signup/free).
Afterwards, go ahead and [fork](http://help.github.com/forking) the [main](https://github.com/darudar/darudar-frontend) DaruDar repository.  
  
## Building DaruDar front-end

To build DaruDar front-end, you check out the source code and use Grunt to generate the non-minified and
minified DaruDar front-end files:

1. To clone your Github repository, run:

        git clone git@github.com:<github username>/darudar-frontend.git

2. To go to the DaruDar front-end directory, run:

        cd darudar-frontend

3. To add the main DaruDar front-end repository as an upstream remote to your repository, run:

        git remote add upstream https://github.com/DaruDar/darudar-frontend.git

4. To add node.js dependencies

        npm install

5. To build DaruDar front-end, run:

        grunt
  

The build output can be located under the `build` directory. Подробнее о структуре этой папки можно узнать в [Руководстве разработчика](http://dev.darudar.org/misc/guide).


<a name="H1_5"></a>
# Submitting Your Changes

To create and submit a change:

1. Create and checkout a new branch off the master branch for your changes:

        git checkout -b my-fix-branch master

2. Create your patch, make sure to have plenty of tests (that pass).

3. Commit your changes and create a descriptive commit message (the commit message is used to generate release notes,
   please check out 
   [commit message conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#)
   and our commit message presubmit hook `validate-commit-msg.js`):

        git commit -a

5. Push your branch to Github:

        git push origin my-fix-branch

6. In Github, send a pull request to `darudar:master`.


7. When the patch is reviewed and merged, delete your branch and pull yours — and other — changes
from the main (upstream) repository:

  1. To delete the branch in Github, run:

            git push origin :my-fix-branch

  2. To check out the master branch, run:

            git checkout master

  3. To delete a local branch, run:

            git branch -D my-fix-branch

  4. To update your master with the latest upstream version, run:

            git pull --ff upstream master

That's it! Thank you for your contribution!
