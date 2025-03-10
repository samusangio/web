const SandboxedModule = require('sandboxed-module')
const path = require('path')
const sinon = require('sinon')
const { expect } = require('chai')
const HttpErrors = require('@overleaf/o-error/http')
const { ObjectId } = require('mongodb')
const Errors = require('../../../../app/src/Features/Errors/Errors')

const MODULE_PATH = path.join(
  __dirname,
  '../../../../app/src/Features/Project/ProjectController'
)

describe('ProjectController', function() {
  beforeEach(function() {
    this.project_id = ObjectId('abcdefabcdefabcdefabcdef')

    this.user = {
      _id: ObjectId('123456123456123456123456'),
      email: 'test@overleaf.com',
      first_name: 'bjkdsjfk',
      features: {},
      emails: [{ email: 'test@overleaf.com' }]
    }
    this.settings = {
      apis: {
        chat: {
          url: 'chat.com'
        }
      },
      siteUrl: 'mysite.com',
      algolia: {}
    }
    this.brandVariationDetails = {
      id: '12',
      active: true,
      brand_name: 'The journal',
      home_url: 'http://www.thejournal.com/',
      publish_menu_link_html: 'Submit your paper to the <em>The Journal</em>'
    }
    this.token = 'some-token'
    this.ProjectDeleter = {
      legacyArchiveProject: sinon.stub().callsArg(1),
      deleteProject: sinon.stub().callsArg(2),
      restoreProject: sinon.stub().callsArg(1),
      findArchivedProjects: sinon.stub()
    }
    this.ProjectDuplicator = {
      duplicate: sinon.stub().callsArgWith(3, null, { _id: this.project_id })
    }
    this.ProjectCreationHandler = {
      createExampleProject: sinon
        .stub()
        .callsArgWith(2, null, { _id: this.project_id }),
      createBasicProject: sinon
        .stub()
        .callsArgWith(2, null, { _id: this.project_id })
    }
    this.SubscriptionLocator = { getUsersSubscription: sinon.stub() }
    this.LimitationsManager = { hasPaidSubscription: sinon.stub() }
    this.TagsHandler = { getAllTags: sinon.stub() }
    this.NotificationsHandler = { getUserNotifications: sinon.stub() }
    this.UserModel = { findById: sinon.stub() }
    this.AuthorizationManager = {
      getPrivilegeLevelForProject: sinon.stub(),
      isRestrictedUser: sinon.stub().returns(false)
    }
    this.EditorController = { renameProject: sinon.stub() }
    this.InactiveProjectManager = { reactivateProjectIfRequired: sinon.stub() }
    this.ProjectUpdateHandler = { markAsOpened: sinon.stub() }
    this.ReferencesSearchHandler = { indexProjectReferences: sinon.stub() }
    this.ProjectGetter = {
      findAllUsersProjects: sinon.stub(),
      getProject: sinon.stub()
    }
    this.ProjectHelper = {
      isArchived: sinon.stub(),
      isTrashed: sinon.stub(),
      isArchivedOrTrashed: sinon.stub()
    }
    this.AuthenticationController = {
      getLoggedInUser: sinon.stub().callsArgWith(1, null, this.user),
      getLoggedInUserId: sinon.stub().returns(this.user._id),
      getSessionUser: sinon.stub().returns(this.user),
      isUserLoggedIn: sinon.stub().returns(true)
    }
    this.AnalyticsManager = { getLastOccurrence: sinon.stub() }
    this.TokenAccessHandler = {
      getRequestToken: sinon.stub().returns(this.token),
      protectTokens: sinon.stub()
    }
    this.CollaboratorsGetter = {
      userIsTokenMember: sinon.stub().callsArgWith(2, null, false)
    }
    this.ProjectEntityHandler = {}
    this.NotificationBuilder = {
      ipMatcherAffiliation: sinon.stub().returns({ create: sinon.stub() })
    }
    this.UserGetter = {
      getUser: sinon
        .stub()
        .callsArgWith(2, null, { lastLoginIp: '192.170.18.2' })
    }
    this.Modules = {
      hooks: {
        fire: sinon.stub()
      }
    }
    this.Features = {
      hasFeature: sinon
        .stub()
        .withArgs('saml')
        .returns(false)
    }
    this.BrandVariationsHandler = {
      getBrandVariationById: sinon
        .stub()
        .callsArgWith(1, null, this.brandVariationDetails)
    }
    this.getUserAffiliations = sinon.stub().callsArgWith(1, null, [
      {
        email: 'test@overleaf.com',
        institution: {
          id: 1,
          name: 'Overleaf',
          ssoEnabled: true
        }
      }
    ])

    this.ProjectController = SandboxedModule.require(MODULE_PATH, {
      globals: {
        console: console
      },
      requires: {
        'settings-sharelatex': this.settings,
        'logger-sharelatex': {
          log() {},
          err() {}
        },
        'metrics-sharelatex': {
          Timer: class {
            done() {}
          },
          inc() {}
        },
        '@overleaf/o-error/http': HttpErrors,
        './ProjectDeleter': this.ProjectDeleter,
        './ProjectDuplicator': this.ProjectDuplicator,
        './ProjectCreationHandler': this.ProjectCreationHandler,
        '../Editor/EditorController': this.EditorController,
        './ProjectHelper': this.ProjectHelper,
        '../Subscription/SubscriptionLocator': this.SubscriptionLocator,
        '../Subscription/LimitationsManager': this.LimitationsManager,
        '../Tags/TagsHandler': this.TagsHandler,
        '../Notifications/NotificationsHandler': this.NotificationsHandler,
        '../../models/User': {
          User: this.UserModel
        },
        '../Authorization/AuthorizationManager': this.AuthorizationManager,
        '../InactiveData/InactiveProjectManager': this.InactiveProjectManager,
        './ProjectUpdateHandler': this.ProjectUpdateHandler,
        '../ReferencesSearch/ReferencesSearchHandler': this
          .ReferencesSearchHandler,
        './ProjectGetter': this.ProjectGetter,
        './ProjectDetailsHandler': this.ProjectDetailsHandler,
        '../Authentication/AuthenticationController': this
          .AuthenticationController,
        '../Analytics/AnalyticsManager': this.AnalyticsManager,
        '../TokenAccess/TokenAccessHandler': this.TokenAccessHandler,
        '../Collaborators/CollaboratorsGetter': this.CollaboratorsGetter,
        '../../infrastructure/Modules': this.Modules,
        './ProjectEntityHandler': this.ProjectEntityHandler,
        '../Errors/Errors': Errors,
        '../../infrastructure/Features': this.Features,
        '../Notifications/NotificationsBuilder': this.NotificationBuilder,
        '../User/UserGetter': this.UserGetter,
        '../BrandVariations/BrandVariationsHandler': this
          .BrandVariationsHandler,
        '../Institutions/InstitutionsAPI': {
          getUserAffiliations: this.getUserAffiliations
        },
        '../V1/V1Handler': {},
        '../../models/Project': {}
      }
    })

    this.projectName = '£12321jkj9ujkljds'
    this.req = {
      params: {
        Project_id: this.project_id
      },
      headers: {},
      connection: {
        remoteAddress: '192.170.18.1'
      },
      session: {
        user: this.user
      },
      body: {
        projectName: this.projectName
      },
      i18n: {
        translate() {}
      },
      ip: '192.170.18.1'
    }
    this.res = {
      locals: {
        jsPath: 'js path here'
      },
      setTimeout: sinon.stub()
    }
  })

  describe('updateProjectSettings', function() {
    it('should update the name', function(done) {
      this.EditorController.renameProject = sinon.stub().callsArg(2)
      this.req.body = { name: (this.name = 'New name') }
      this.res.sendStatus = code => {
        this.EditorController.renameProject
          .calledWith(this.project_id, this.name)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectSettings(this.req, this.res)
    })

    it('should update the compiler', function(done) {
      this.EditorController.setCompiler = sinon.stub().callsArg(2)
      this.req.body = { compiler: (this.compiler = 'pdflatex') }
      this.res.sendStatus = code => {
        this.EditorController.setCompiler
          .calledWith(this.project_id, this.compiler)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectSettings(this.req, this.res)
    })

    it('should update the imageName', function(done) {
      this.EditorController.setImageName = sinon.stub().callsArg(2)
      this.req.body = { imageName: (this.imageName = 'texlive-1234.5') }
      this.res.sendStatus = code => {
        this.EditorController.setImageName
          .calledWith(this.project_id, this.imageName)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectSettings(this.req, this.res)
    })

    it('should update the spell check language', function(done) {
      this.EditorController.setSpellCheckLanguage = sinon.stub().callsArg(2)
      this.req.body = { spellCheckLanguage: (this.languageCode = 'fr') }
      this.res.sendStatus = code => {
        this.EditorController.setSpellCheckLanguage
          .calledWith(this.project_id, this.languageCode)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectSettings(this.req, this.res)
    })

    it('should update the root doc', function(done) {
      this.EditorController.setRootDoc = sinon.stub().callsArg(2)
      this.req.body = { rootDocId: (this.rootDocId = 'root-doc-id') }
      this.res.sendStatus = code => {
        this.EditorController.setRootDoc
          .calledWith(this.project_id, this.rootDocId)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectSettings(this.req, this.res)
    })
  })

  describe('updateProjectAdminSettings', function() {
    it('should update the public access level', function(done) {
      this.EditorController.setPublicAccessLevel = sinon.stub().callsArg(2)
      this.req.body = {
        publicAccessLevel: (this.publicAccessLevel = 'readonly')
      }
      this.res.sendStatus = code => {
        this.EditorController.setPublicAccessLevel
          .calledWith(this.project_id, this.publicAccessLevel)
          .should.equal(true)
        code.should.equal(204)
        done()
      }
      this.ProjectController.updateProjectAdminSettings(this.req, this.res)
    })
  })

  describe('deleteProject', function() {
    it('should tell the project deleter to archive when forever=false', function(done) {
      this.res.sendStatus = code => {
        this.ProjectDeleter.legacyArchiveProject
          .calledWith(this.project_id)
          .should.equal(true)
        code.should.equal(200)
        done()
      }
      this.ProjectController.deleteProject(this.req, this.res)
    })

    it('should tell the project deleter to delete when forever=true', function(done) {
      this.req.query = { forever: 'true' }
      this.res.sendStatus = code => {
        this.ProjectDeleter.deleteProject
          .calledWith(this.project_id, {
            deleterUser: this.user,
            ipAddress: this.req.ip
          })
          .should.equal(true)
        code.should.equal(200)
        done()
      }
      this.ProjectController.deleteProject(this.req, this.res)
    })
  })

  describe('restoreProject', function() {
    it('should tell the project deleter', function(done) {
      this.res.sendStatus = code => {
        this.ProjectDeleter.restoreProject
          .calledWith(this.project_id)
          .should.equal(true)
        code.should.equal(200)
        done()
      }
      this.ProjectController.restoreProject(this.req, this.res)
    })
  })

  describe('cloneProject', function() {
    it('should call the project duplicator', function(done) {
      this.res.send = json => {
        this.ProjectDuplicator.duplicate
          .calledWith(this.user, this.project_id, this.projectName)
          .should.equal(true)
        json.project_id.should.equal(this.project_id)
        done()
      }
      this.ProjectController.cloneProject(this.req, this.res)
    })
  })

  describe('newProject', function() {
    it('should call the projectCreationHandler with createExampleProject', function(done) {
      this.req.body.template = 'example'
      this.res.send = json => {
        this.ProjectCreationHandler.createExampleProject
          .calledWith(this.user._id, this.projectName)
          .should.equal(true)
        this.ProjectCreationHandler.createBasicProject.called.should.equal(
          false
        )
        done()
      }
      this.ProjectController.newProject(this.req, this.res)
    })

    it('should call the projectCreationHandler with createBasicProject', function(done) {
      this.req.body.template = 'basic'
      this.res.send = json => {
        this.ProjectCreationHandler.createExampleProject.called.should.equal(
          false
        )
        this.ProjectCreationHandler.createBasicProject
          .calledWith(this.user._id, this.projectName)
          .should.equal(true)
        done()
      }
      this.ProjectController.newProject(this.req, this.res)
    })
  })

  describe('projectListPage', function() {
    beforeEach(function() {
      this.tags = [
        { name: 1, project_ids: ['1', '2', '3'] },
        { name: 2, project_ids: ['a', '1'] },
        { name: 3, project_ids: ['a', 'b', 'c', 'd'] }
      ]
      this.notifications = [
        { _id: '1', user_id: '2', templateKey: '3', messageOpts: '4', key: '5' }
      ]
      this.projects = [
        { _id: 1, lastUpdated: 1, owner_ref: 'user-1' },
        { _id: 2, lastUpdated: 2, owner_ref: 'user-2', lastUpdatedBy: 'user-1' }
      ]
      this.collabertions = [{ _id: 5, lastUpdated: 5, owner_ref: 'user-1' }]
      this.readOnly = [{ _id: 3, lastUpdated: 3, owner_ref: 'user-1' }]
      this.tokenReadAndWrite = [{ _id: 6, lastUpdated: 5, owner_ref: 'user-4' }]
      this.tokenReadOnly = [{ _id: 7, lastUpdated: 4, owner_ref: 'user-5' }]
      this.allProjects = {
        owned: this.projects,
        readAndWrite: this.collabertions,
        readOnly: this.readOnly,
        tokenReadAndWrite: this.tokenReadAndWrite,
        tokenReadOnly: this.tokenReadOnly
      }

      this.users = {
        'user-1': {
          first_name: 'James'
        },
        'user-2': {
          first_name: 'Henry'
        }
      }
      this.users[this.user._id] = this.user // Owner
      this.UserModel.findById = (id, fields, callback) => {
        callback(null, this.users[id])
      }
      this.UserGetter.getUser = (id, fields, callback) => {
        callback(null, this.users[id])
      }

      this.LimitationsManager.hasPaidSubscription.callsArgWith(1, null, false)
      this.TagsHandler.getAllTags.callsArgWith(1, null, this.tags)
      this.NotificationsHandler.getUserNotifications = sinon
        .stub()
        .callsArgWith(1, null, this.notifications, {})
      this.ProjectGetter.findAllUsersProjects.callsArgWith(
        2,
        null,
        this.allProjects
      )
      this.Modules.hooks.fire
        .withArgs('findAllV1Projects', this.user._id)
        .yields(undefined)
    }) // Without integration module hook, cb returns undefined

    it('should render the project/list page', function(done) {
      this.res.render = (pageName, opts) => {
        pageName.should.equal('project/list')
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should send the tags', function(done) {
      this.res.render = (pageName, opts) => {
        opts.tags.length.should.equal(this.tags.length)
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should create trigger ip matcher notifications', function(done) {
      this.settings.overleaf = true
      this.res.render = (pageName, opts) => {
        this.NotificationBuilder.ipMatcherAffiliation.called.should.equal(true)
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should send the projects', function(done) {
      this.res.render = (pageName, opts) => {
        opts.projects.length.should.equal(
          this.projects.length +
            this.collabertions.length +
            this.readOnly.length +
            this.tokenReadAndWrite.length +
            this.tokenReadOnly.length
        )
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should send the user', function(done) {
      this.res.render = (pageName, opts) => {
        opts.user.should.deep.equal(this.user)
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should inject the users', function(done) {
      this.res.render = (pageName, opts) => {
        opts.projects[0].owner.should.equal(
          this.users[this.projects[0].owner_ref]
        )
        opts.projects[1].owner.should.equal(
          this.users[this.projects[1].owner_ref]
        )
        opts.projects[1].lastUpdatedBy.should.equal(
          this.users[this.projects[1].lastUpdatedBy]
        )
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should send hasSubscription == false when no subscription', function(done) {
      this.res.render = (pageName, opts) => {
        opts.hasSubscription.should.equal(false)
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should send hasSubscription == true when there is a subscription', function(done) {
      this.LimitationsManager.hasPaidSubscription = sinon
        .stub()
        .callsArgWith(1, null, true)
      this.res.render = (pageName, opts) => {
        opts.hasSubscription.should.equal(true)
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    describe('when there is a v1 connection error', function() {
      beforeEach(function() {
        this.Features.hasFeature = sinon
          .stub()
          .withArgs('overleaf-integration')
          .returns(true)
        this.connectionWarning =
          'Error accessing Overleaf V1. Some of your projects or features may be missing.'
      })

      it('should show a warning when there is an error getting v1 projects', function(done) {
        this.Modules.hooks.fire
          .withArgs('findAllV1Projects', this.user._id)
          .yields(new Errors.V1ConnectionError('error'))
        this.res.render = (pageName, opts) => {
          expect(opts.warnings).to.contain(this.connectionWarning)
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should show a warning when there is an error getting subscriptions from v1', function(done) {
        this.LimitationsManager.hasPaidSubscription.yields(
          new Errors.V1ConnectionError('error')
        )
        this.res.render = (pageName, opts) => {
          expect(opts.warnings).to.contain(this.connectionWarning)
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should show a warning when there is an error getting affiliations from v1', function(done) {
        this.getUserAffiliations.yields(new Errors.V1ConnectionError('error'))
        this.res.render = (pageName, opts) => {
          expect(opts.warnings).to.contain(this.connectionWarning)
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
    })

    describe('front widget', function(done) {
      beforeEach(function() {
        this.settings.overleaf = {
          front_chat_widget_room_id: 'chat-room-id'
        }
      })

      it('should show for paid users', function(done) {
        this.user.features.github = true
        this.user.features.dropbox = true
        this.res.render = (pageName, opts) => {
          opts.frontChatWidgetRoomId.should.equal(
            this.settings.overleaf.front_chat_widget_room_id
          )
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should show for sample users', function(done) {
        this.user._id = ObjectId('588f3ddae8ebc1bac07c9f00') // last two digits
        this.res.render = (pageName, opts) => {
          opts.frontChatWidgetRoomId.should.equal(
            this.settings.overleaf.front_chat_widget_room_id
          )
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should not show for non sample users', function(done) {
        this.user._id = ObjectId('588f3ddae8ebc1bac07c9fff') // last two digits
        this.res.render = (pageName, opts) => {
          expect(opts.frontChatWidgetRoomId).to.equal(undefined)
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
    })

    describe('with overleaf-integration-web-module hook', function() {
      beforeEach(function() {
        this.Features.hasFeature = sinon
          .stub()
          .withArgs('overleaf-integration')
          .returns(true)
        this.V1Response = {
          projects: [
            {
              id: '123mockV1Id',
              title: 'mock title',
              updated_at: 1509616411,
              removed: false,
              archived: false
            },
            {
              id: '456mockV1Id',
              title: 'mock title 2',
              updated_at: 1509616411,
              removed: true,
              archived: false
            }
          ],
          tags: [{ name: 'mock tag', project_ids: ['123mockV1Id'] }]
        }
        this.Modules.hooks.fire
          .withArgs('findAllV1Projects', this.user._id)
          .yields(null, [this.V1Response])
      }) // Need to wrap response in array, as multiple hooks could fire

      it('should include V1 projects', function(done) {
        this.res.render = (pageName, opts) => {
          opts.projects.length.should.equal(
            this.projects.length +
              this.collabertions.length +
              this.readOnly.length +
              this.tokenReadAndWrite.length +
              this.tokenReadOnly.length +
              this.V1Response.projects.length
          )
          opts.projects.forEach(p => {
            // Check properties correctly mapped from V1
            expect(p).to.have.property('id')
            expect(p).to.have.property('name')
            expect(p).to.have.property('lastUpdated')
            expect(p).to.have.property('accessLevel')
            expect(p).to.have.property('archived')
          })
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should include V1 tags', function(done) {
        this.res.render = (pageName, opts) => {
          opts.tags.length.should.equal(
            this.tags.length + this.V1Response.tags.length
          )
          opts.tags.forEach(t => {
            expect(t).to.have.property('name')
            expect(t).to.have.property('project_ids')
          })
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })

      it('should have isShowingV1Projects flag', function(done) {
        this.res.render = (pageName, opts) => {
          opts.isShowingV1Projects.should.equal(true)
          done()
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
    })

    describe('When Institution SSO is released', function() {
      beforeEach(function(done) {
        this.institutionEmail = 'test@overleaf.com'
        this.institutionName = 'Overleaf'
        this.Features.hasFeature.withArgs('saml').returns(true)
        done()
      })
      it('should show institution SSO available notification', function() {
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.include({
            email: 'test@overleaf.com',
            institutionId: 1,
            institutionName: 'Overleaf',
            templateKey: 'notification_institution_sso_available'
          })
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      it('should show a linked notification', function() {
        this.req.session.saml = {
          institutionEmail: this.institutionEmail,
          linked: {
            hasEntitlement: false,
            universityName: this.institutionName
          }
        }
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.include({
            email: this.institutionEmail,
            institutionName: this.institutionName,
            templateKey: 'notification_institution_sso_linked'
          })
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      it('should show a linked another email notification', function() {
        // when they request to link an email but the institution returns
        // a different email
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.include({
            institutionEmail: this.institutionEmail,
            requestedEmail: 'requested@overleaf.com',
            templateKey: 'notification_institution_sso_non_canonical'
          })
        }
        this.req.session.saml = {
          emailNonCanonical: this.institutionEmail,
          institutionEmail: this.institutionEmail,
          requestedEmail: 'requested@overleaf.com',
          linked: {
            hasEntitlement: false,
            universityName: this.institutionName
          }
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      it('should show a notification when intent was to register via SSO but account existed', function() {
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.include({
            email: this.institutionEmail,
            templateKey: 'notification_institution_sso_already_registered'
          })
        }
        this.req.session.saml = {
          institutionEmail: this.institutionEmail,
          linked: {
            hasEntitlement: false,
            universityName: 'Overleaf'
          },
          registerIntercept: {
            id: 1,
            name: 'Example University'
          }
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      it('should not show a register notification if the flow was abandoned', function() {
        // could initially start to register with an SSO email and then
        // abandon flow and login with an existing non-institution SSO email
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.not.include({
            email: 'test@overleaf.com',
            templateKey: 'notification_institution_sso_already_registered'
          })
        }
        this.req.session.saml = {
          registerIntercept: {
            id: 1,
            name: 'Example University'
          }
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      it('should show institution account linked to another account', function() {
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.include({
            templateKey: 'notification_institution_sso_linked_by_another'
          })
          // Also check other notifications are not shown
          expect(opts.notificationsInstitution).to.not.deep.include({
            email: this.institutionEmail,
            templateKey: 'notification_institution_sso_already_registered'
          })
          expect(opts.notificationsInstitution).to.not.deep.include({
            institutionEmail: this.institutionEmail,
            requestedEmail: 'requested@overleaf.com',
            templateKey: 'notification_institution_sso_non_canonical'
          })
          expect(opts.notificationsInstitution).to.not.deep.include({
            email: this.institutionEmail,
            institutionName: this.institutionName,
            templateKey: 'notification_institution_sso_linked'
          })
        }
        this.req.session.saml = {
          emailNonCanonical: this.institutionEmail,
          institutionEmail: this.institutionEmail,
          requestedEmail: 'requested@overleaf.com',
          linkedToAnother: true
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
      describe('when linking/logging in initiated on institution side', function() {
        it('should not show a linked another email notification', function() {
          // this is only used when initated on Overleaf,
          // because we keep track of the requested email they tried to link
          this.res.render = (pageName, opts) => {
            expect(opts.notificationsInstitution).to.not.deep.include({
              institutionEmail: this.institutionEmail,
              requestedEmail: undefined,
              templateKey: 'notification_institution_sso_non_canonical'
            })
          }
          this.req.session.saml = {
            emailNonCanonical: this.institutionEmail,
            institutionEmail: this.institutionEmail,
            linked: {
              hasEntitlement: false,
              universityName: this.institutionName
            }
          }
          this.ProjectController.projectListPage(this.req, this.res)
        })
      })
    })

    describe('When Institution SSO is not released', function() {
      beforeEach(function(done) {
        this.Features.hasFeature.withArgs('saml').returns(false)
        done()
      })
      it('should not show institution sso available notification', function() {
        this.res.render = (pageName, opts) => {
          expect(opts.notificationsInstitution).to.deep.not.include({
            email: 'test@overleaf.com',
            institutionId: 1,
            institutionName: 'Overleaf',
            templateKey: 'notification_institution_sso_available'
          })
        }
        this.ProjectController.projectListPage(this.req, this.res)
      })
    })
  })

  describe('projectListPage with duplicate projects', function() {
    beforeEach(function() {
      this.tags = [
        { name: 1, project_ids: ['1', '2', '3'] },
        { name: 2, project_ids: ['a', '1'] },
        { name: 3, project_ids: ['a', 'b', 'c', 'd'] }
      ]
      this.notifications = [
        { _id: '1', user_id: '2', templateKey: '3', messageOpts: '4', key: '5' }
      ]
      this.projects = [
        { _id: 1, lastUpdated: 1, owner_ref: 'user-1' },
        { _id: 2, lastUpdated: 2, owner_ref: 'user-2' }
      ]
      this.collabertions = [{ _id: 5, lastUpdated: 5, owner_ref: 'user-1' }]
      this.readOnly = [{ _id: 3, lastUpdated: 3, owner_ref: 'user-1' }]
      this.tokenReadAndWrite = [{ _id: 6, lastUpdated: 5, owner_ref: 'user-4' }]
      this.tokenReadOnly = [
        { _id: 6, lastUpdated: 5, owner_ref: 'user-4' }, // Also in tokenReadAndWrite
        { _id: 7, lastUpdated: 4, owner_ref: 'user-5' }
      ]
      this.allProjects = {
        owned: this.projects,
        readAndWrite: this.collabertions,
        readOnly: this.readOnly,
        tokenReadAndWrite: this.tokenReadAndWrite,
        tokenReadOnly: this.tokenReadOnly
      }

      this.users = {
        'user-1': {
          first_name: 'James'
        },
        'user-2': {
          first_name: 'Henry'
        }
      }
      this.users[this.user._id] = this.user // Owner
      this.UserModel.findById = (id, fields, callback) => {
        callback(null, this.users[id])
      }

      this.LimitationsManager.hasPaidSubscription.callsArgWith(1, null, false)
      this.TagsHandler.getAllTags.callsArgWith(1, null, this.tags)
      this.NotificationsHandler.getUserNotifications = sinon
        .stub()
        .callsArgWith(1, null, this.notifications, {})
      this.ProjectGetter.findAllUsersProjects.callsArgWith(
        2,
        null,
        this.allProjects
      )
      this.Modules.hooks.fire
        .withArgs('findAllV1Projects', this.user._id)
        .yields(undefined)
    }) // Without integration module hook, cb returns undefined

    it('should render the project/list page', function(done) {
      this.res.render = (pageName, opts) => {
        pageName.should.equal('project/list')
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })

    it('should omit one of the projects', function(done) {
      this.res.render = (pageName, opts) => {
        opts.projects.length.should.equal(
          this.projects.length +
            this.collabertions.length +
            this.readOnly.length +
            this.tokenReadAndWrite.length +
            this.tokenReadOnly.length -
            1
        )
        done()
      }
      this.ProjectController.projectListPage(this.req, this.res)
    })
  })

  describe('renameProject', function() {
    beforeEach(function() {
      this.newProjectName = 'my supper great new project'
      this.req.body.newProjectName = this.newProjectName
    })

    it('should call the editor controller', function(done) {
      this.EditorController.renameProject.callsArgWith(2)
      this.res.sendStatus = code => {
        code.should.equal(200)
        this.EditorController.renameProject
          .calledWith(this.project_id, this.newProjectName)
          .should.equal(true)
        done()
      }
      this.ProjectController.renameProject(this.req, this.res)
    })

    it('should send an error to next() if there is a problem', function(done) {
      let error
      this.EditorController.renameProject.callsArgWith(
        2,
        (error = new Error('problem'))
      )
      const next = e => {
        e.should.equal(error)
        done()
      }
      this.ProjectController.renameProject(this.req, this.res, next)
    })
  })

  describe('loadEditor', function() {
    beforeEach(function() {
      this.settings.editorIsOpen = true
      this.project = {
        name: 'my proj',
        _id: '213123kjlkj',
        owner_ref: '59fc84d5fbea77482d436e1b'
      }
      this.brandedProject = {
        name: 'my branded proj',
        _id: '3252332',
        owner_ref: '59fc84d5fbea77482d436e1b',
        brandVariationId: '12'
      }
      this.user = {
        _id: '588f3ddae8ebc1bac07c9fa4',
        ace: {
          fontSize: 'massive',
          theme: 'sexy'
        },
        email: 'bob@bob.com'
      }
      this.ProjectGetter.getProject.callsArgWith(2, null, this.project)
      this.UserModel.findById.callsArgWith(1, null, this.user)
      this.SubscriptionLocator.getUsersSubscription.callsArgWith(1, null, {})
      this.AuthorizationManager.getPrivilegeLevelForProject.callsArgWith(
        3,
        null,
        'owner'
      )
      this.ProjectDeleter.unmarkAsDeletedByExternalSource = sinon.stub()
      this.InactiveProjectManager.reactivateProjectIfRequired.callsArgWith(1)
      this.AnalyticsManager.getLastOccurrence.yields(null, { mock: 'event' })
      this.ProjectUpdateHandler.markAsOpened.callsArgWith(1)
    })

    it('should render the project/editor page', function(done) {
      this.res.render = (pageName, opts) => {
        pageName.should.equal('project/editor')
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should add user', function(done) {
      this.res.render = (pageName, opts) => {
        opts.user.email.should.equal(this.user.email)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should add on userSettings', function(done) {
      this.res.render = (pageName, opts) => {
        opts.userSettings.fontSize.should.equal(this.user.ace.fontSize)
        opts.userSettings.editorTheme.should.equal(this.user.ace.theme)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should add isRestrictedTokenMember', function(done) {
      this.res.render = (pageName, opts) => {
        opts.isRestrictedTokenMember.should.exist
        opts.isRestrictedTokenMember.should.equal(false)
        return done()
      }
      return this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should set isRestrictedTokenMember when appropriate', function(done) {
      this.AuthorizationManager.isRestrictedUser.returns(true)
      this.res.render = (pageName, opts) => {
        opts.isRestrictedTokenMember.should.exist
        opts.isRestrictedTokenMember.should.equal(true)
        return done()
      }
      return this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should render the closed page if the editor is closed', function(done) {
      this.settings.editorIsOpen = false
      this.res.render = (pageName, opts) => {
        pageName.should.equal('general/closed')
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should not render the page if the project can not be accessed', function(done) {
      this.AuthorizationManager.getPrivilegeLevelForProject = sinon
        .stub()
        .callsArgWith(3, null, null)
      this.res.sendStatus = (resCode, opts) => {
        resCode.should.equal(401)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should reactivateProjectIfRequired', function(done) {
      this.res.render = (pageName, opts) => {
        this.InactiveProjectManager.reactivateProjectIfRequired
          .calledWith(this.project_id)
          .should.equal(true)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should mark project as opened', function(done) {
      this.res.render = (pageName, opts) => {
        this.ProjectUpdateHandler.markAsOpened
          .calledWith(this.project_id)
          .should.equal(true)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should call the brand variations handler for branded projects', function(done) {
      this.ProjectGetter.getProject.callsArgWith(2, null, this.brandedProject)
      this.res.render = (pageName, opts) => {
        this.BrandVariationsHandler.getBrandVariationById
          .calledWith()
          .should.equal(true)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should not call the brand variations handler for unbranded projects', function(done) {
      this.res.render = (pageName, opts) => {
        this.BrandVariationsHandler.getBrandVariationById.called.should.equal(
          false
        )
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })

    it('should expose the brand variation details as locals for branded projects', function(done) {
      this.ProjectGetter.getProject.callsArgWith(2, null, this.brandedProject)
      this.res.render = (pageName, opts) => {
        opts.brandVariation.should.deep.equal(this.brandVariationDetails)
        done()
      }
      this.ProjectController.loadEditor(this.req, this.res)
    })
  })

  describe('userProjectsJson', function() {
    beforeEach(function(done) {
      const projects = [
        {
          archived: true,
          trashed: true,
          id: 'a',
          name: 'A',
          accessLevel: 'a',
          somethingElse: 1
        },
        {
          archived: false,
          id: 'b',
          name: 'B',
          accessLevel: 'b',
          somethingElse: 1
        },
        {
          archived: false,
          trashed: true,
          id: 'c',
          name: 'C',
          accessLevel: 'c',
          somethingElse: 1
        },
        {
          archived: false,
          trashed: false,
          id: 'd',
          name: 'D',
          accessLevel: 'd',
          somethingElse: 1
        }
      ]

      this.ProjectHelper.isArchivedOrTrashed
        .withArgs(projects[0], this.user._id)
        .returns(true)
      this.ProjectHelper.isArchivedOrTrashed
        .withArgs(projects[1], this.user._id)
        .returns(false)
      this.ProjectHelper.isArchivedOrTrashed
        .withArgs(projects[2], this.user._id)
        .returns(true)
      this.ProjectHelper.isArchivedOrTrashed
        .withArgs(projects[3], this.user._id)
        .returns(false)

      this.ProjectGetter.findAllUsersProjects = sinon
        .stub()
        .callsArgWith(2, null, [])
      this.ProjectController._buildProjectList = sinon.stub().returns(projects)
      this.AuthenticationController.getLoggedInUserId = sinon
        .stub()
        .returns(this.user._id)
      done()
    })

    it('should produce a list of projects', function(done) {
      this.res.json = data => {
        expect(data).to.deep.equal({
          projects: [
            { _id: 'b', name: 'B', accessLevel: 'b' },
            { _id: 'd', name: 'D', accessLevel: 'd' }
          ]
        })
        done()
      }
      this.ProjectController.userProjectsJson(this.req, this.res, this.next)
    })
  })

  describe('projectEntitiesJson', function() {
    beforeEach(function() {
      this.AuthenticationController.getLoggedInUserId = sinon
        .stub()
        .returns('abc')
      this.req.params = { Project_id: 'abcd' }
      this.project = { _id: 'abcd' }
      this.docs = [
        { path: '/things/b.txt', doc: true },
        { path: '/main.tex', doc: true }
      ]
      this.files = [{ path: '/things/a.txt' }]
      this.ProjectGetter.getProject = sinon
        .stub()
        .callsArgWith(1, null, this.project)
      this.ProjectEntityHandler.getAllEntitiesFromProject = sinon
        .stub()
        .callsArgWith(1, null, this.docs, this.files)
    })

    it('should produce a list of entities', function(done) {
      this.res.json = data => {
        expect(data).to.deep.equal({
          project_id: 'abcd',
          entities: [
            { path: '/main.tex', type: 'doc' },
            { path: '/things/a.txt', type: 'file' },
            { path: '/things/b.txt', type: 'doc' }
          ]
        })
        expect(this.ProjectGetter.getProject.callCount).to.equal(1)
        expect(
          this.ProjectEntityHandler.getAllEntitiesFromProject.callCount
        ).to.equal(1)
        done()
      }
      this.ProjectController.projectEntitiesJson(this.req, this.res, this.next)
    })
  })

  describe('_buildProjectViewModel', function() {
    beforeEach(function() {
      this.ProjectHelper.isArchived.returns(false)
      this.project = {
        _id: 'abcd',
        name: 'netsenits',
        lastUpdated: 1,
        lastUpdatedBy: 2,
        publicAccesLevel: 'private',
        archived: false,
        owner_ref: 'defg',
        tokens: {
          readAndWrite: '1abcd',
          readAndWritePrefix: '1',
          readOnly: 'neiotsranteoia'
        }
      }
    })

    it('should produce a model of the project', function() {
      const result = this.ProjectController._buildProjectViewModel(
        this.project,
        'readAndWrite',
        'owner',
        this.user._id
      )
      expect(result).to.exist
      expect(result).to.be.object
      expect(result).to.deep.equal({
        id: 'abcd',
        name: 'netsenits',
        lastUpdated: 1,
        lastUpdatedBy: 2,
        publicAccessLevel: 'private',
        accessLevel: 'readAndWrite',
        source: 'owner',
        archived: false,
        owner_ref: 'defg',
        tokens: {
          readAndWrite: '1abcd',
          readAndWritePrefix: '1',
          readOnly: 'neiotsranteoia'
        },
        isV1Project: false
      })
    })

    describe('when token-read-only access', function() {
      it('should redact the owner and last-updated data', function() {
        const result = this.ProjectController._buildProjectViewModel(
          this.project,
          'readOnly',
          'token',
          this.user._id
        )
        expect(result).to.exist
        expect(result).to.be.object
        expect(result).to.deep.equal({
          id: 'abcd',
          name: 'netsenits',
          lastUpdated: 1,
          lastUpdatedBy: null,
          publicAccessLevel: 'private',
          accessLevel: 'readOnly',
          source: 'token',
          archived: false,
          owner_ref: null,
          tokens: {
            readAndWrite: '1abcd',
            readAndWritePrefix: '1',
            readOnly: 'neiotsranteoia'
          },
          isV1Project: false
        })
      })
    })
  })
  describe('_isInPercentageRollout', function() {
    before(function() {
      this.ids = [
        '5a05cd7621f9fe22be131740',
        '5a05cd7821f9fe22be131741',
        '5a05cd7921f9fe22be131742',
        '5a05cd7a21f9fe22be131743',
        '5a05cd7b21f9fe22be131744',
        '5a05cd7c21f9fe22be131745',
        '5a05cd7d21f9fe22be131746',
        '5a05cd7e21f9fe22be131747',
        '5a05cd7f21f9fe22be131748',
        '5a05cd8021f9fe22be131749',
        '5a05cd8021f9fe22be13174a',
        '5a05cd8121f9fe22be13174b',
        '5a05cd8221f9fe22be13174c',
        '5a05cd8221f9fe22be13174d',
        '5a05cd8321f9fe22be13174e',
        '5a05cd8321f9fe22be13174f',
        '5a05cd8421f9fe22be131750',
        '5a05cd8421f9fe22be131751',
        '5a05cd8421f9fe22be131752',
        '5a05cd8521f9fe22be131753'
      ]
    })

    it('should produce the expected results', function() {
      expect(
        this.ids.map(i =>
          this.ProjectController._isInPercentageRollout('abcd', i, 50)
        )
      ).to.deep.equal([
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        true,
        false,
        true
      ])
      expect(
        this.ids.map(i =>
          this.ProjectController._isInPercentageRollout('efgh', i, 50)
        )
      ).to.deep.equal([
        false,
        false,
        false,
        false,
        true,
        false,
        false,
        true,
        false,
        false,
        true,
        true,
        true,
        false,
        true,
        false,
        true,
        true,
        false,
        false
      ])
    })
  })
})
