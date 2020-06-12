(function () {

    /**
     * This controller contains functions specific to the admin page.
     * @param $scope - binding between controller and HTML page
     * @param $window - the browser window object
     * @param $controller - service for instantiating controllers
     * @param $uibModal - the UI Bootstrap service for creating modals
     * @param dataProvider - service function that provides GET and POST requests for getting or updating data
     */
    function AdminJsController($scope, $window, $uibModal, $controller, dataProvider, groupingsService) {

        $scope.adminsList = [];
        $scope.pagedItemsAdmins = [];
        $scope.currentPageAdmins = 0;
        $scope.personList = [];
        $scope.pagedItemsPerson = [];
        $scope.currentPagePerson = 0;
        $scope.selectedGroupingsNames = [];
        $scope.multiMemberPaths = [];

        let totalCheckBoxCount = 0;
        let count = 0;

        // Allow this controller to use functions from the General Controller
        angular.extend(this, $controller("GeneralJsController", { $scope: $scope }));


        $scope.createRoleErrorModal = function () {
            $scope.loading = false;
            $scope.RoleErrorModalInstance = $uibModal.open({
                templateUrl: "modal/roleErrorModal",
                scope: $scope,
                backdrop: "static",
                keyboard: false
            });
        };


        /**
         * Initializes the page, displaying the list of groupings to administer and the list of admins to manage.
         */
        $scope.init = function () {
            // Adds the loading spinner.
            $scope.loading = true;
            groupingsService.getAdminLists(function (res) {
                $scope.adminsList = _.sortBy(res.adminGroup.members, "name");
                $scope.filter($scope.adminsList, "pagedItemsAdmins", "currentPageAdmins", $scope.adminsQuery, true);

                $scope.groupingsList = _.sortBy(res.allGroupings, "name");
                $scope.filter($scope.groupingsList, "pagedItemsGroupings", "currentPageGroupings", $scope.groupingsQuery, true);
                $scope.loading = false;

            }, function (res) {
                if (res.status === 403) {
                    $scope.createRoleErrorModal();
                }
            });
        };

        $scope.searchForUserGroupingInformation = function () {
            if ($scope.personToLookup == "") {
                console.log("Search bar is empty...");
            } else {
                $scope.loading = true;
                groupingsService.getMembershipAssignmentForUser(function (res) {

                    // put each membership in an array.
                    let data = [];
                    _.forEach(groupingsService.parseGenericResponseData(res).memberships, (membership) => {
                        data.push(groupingsService.parseGenericResponseData(membership));
                    });
                    console.log(data);

                    // filter all the dups into there own sub arrays.
                    let dups = [];
                    _.forEach(data, (membership) => {
                        dups.push(data.filter(ms => {
                            if (ms.name === membership.name) {
                                return ms;
                            }
                            ;
                        }));
                    });
                    console.log(dups);
                    
                    // merge the boolean values of all dups.
                    let result = [];
                    _.forEach(dups, (membership) => {
                        if (membership.length > 1) {
                            _.forEach(membership, m => {
                                membership[0].inInclude |= m.inInclude;
                                membership[0].inExclude |= m.inExclude;
                                membership[0].inBasis |= m.inBasis;
                                membership[0].inOwner |= m.inOwner;
                            });
                        }
                        membership[0].isSelected = false;
                        membership[0].includeIsSelected = false;
                        membership[0].ownerIsSelected = false;
                        result.push(membership[0]);
                    });
                    result = _.sortBy(_.uniq(result), "name");

                    // Chunk array to pages
                    let i = 0;
                    const pageSize = 20;
                    while (i < result.length) {
                        $scope.pagedItemsPerson.push(result.slice(i, pageSize + i));
                        i += pageSize;
                    }



                    /*
                    $scope.personList = _.sortBy(res.combinedGroupings, "name");
                    $scope.filter($scope.personList, "pagedItemsPerson", "currentPagePerson", $scope.personQuery, true);
                    _.forEach($scope.pagedItemsPerson[$scope.currentPagePerson], function (group) {
                        group["inOwner"] = res.inOwner[group.path];
                        group["inBasis"] = res.inBasis[group.path];
                        group["inInclude"] = res.inInclude[group.path];
                        group["inExclude"] = res.inExclude[group.path];
                        if (group.inInclude || group.inOwner) {
                            group["isSelected"] = false;
                            group["includeIsSelected"] = false;
                            group["ownerIsSelected"] = false;
                            totalCheckBoxCount = totalCheckBoxCount + 1;
                        }
                    });
                     */
                    $scope.loading = false;
                }, function (res) {
                    dataProvider.handleException({ exceptionMessage: JSON.stringify(res, null, 4) }, "feedback/error", "feedback");
                }, $scope.personToLookup);
            }
        };

        $scope.displayAdmins = function () {
            $scope.resetGroupingInformation();
            $scope.filter($scope.adminsList, "pagedItemsAdmins", "currentPageAdmins", $scope.adminsQuery, true);
            $scope.pagedItemsGroupings = $scope.groupToPages($scope.groupingsList);
            $scope.showGrouping = false;
        };

        /*todo:people copy*/
        $scope.displayPerson = function () {
            console.log($scope.personList);
            $scope.resetGroupingInformation();
            $scope.filter($scope.personList, "pagedItemsPerson", "currentPagePerson", $scope.personQuery, true);
            $scope.pagedItemsPerson = $scope.groupToPages($scope.personList);
            $scope.showGrouping = false;
            $scope.personToLookup = "";
        };

        $scope.removeFromGroups = function () {
            $scope.selectedGroupings = [];
            $scope.selectedGroupingsNames = [];
            let i = 0;
            _.forEach($scope.pagedItemsPerson[$scope.currentPagePerson], function (grouping) {
                if (grouping.isSelected || grouping.ownerIsSelected || grouping.includeIsSelected) {
                    if (i == 0) {
                        let temp = grouping.path;
                        $scope.selectedGrouping.path = temp;
                        $scope.multiMemberPaths[i] = temp;

                    } else {
                        let temp = grouping.path;
                        $scope.selectedGrouping.path = $scope.selectedGrouping.path + temp;
                        $scope.multiMemberPaths[i] = temp;
                    }
                    if (grouping.ownerIsSelected) {
                        $scope.selectedGroupings.push(grouping.path + ":owners");
                        let temp = grouping.path;
                        temp = temp.split(":").pop();
                        $scope.selectedGroupingsNames.push(temp);
                    }
                    if (grouping.includeIsSelected) {
                        $scope.selectedGroupings.push(grouping.path + ":include");
                        let temp = grouping.path;
                        temp = temp.split(":").pop();
                        $scope.selectedGroupingsNames.push(temp);
                    }
                }
                i++;
            });

            if ($scope.personToLookup != null) {
                groupingsService.getMemberAttributes($scope.personToLookup, function (attributes) {
                    let userToRemove = {
                        username: attributes.uid,
                        name: attributes.cn,
                        uhUuid: attributes.uhUuid
                    };
                    if (_.isEmpty($scope.selectedGroupings)) {
                        $scope.createOwnerErrorModal($scope.selectedGroupings);
                    } else {
                        $scope.createRemoveFromGroupsModal({
                            user: userToRemove,
                            listName: $scope.selectedGroupingsNames
                        });
                    }
                });
            }

        };

        $scope.updateCheckBoxes = function () {
            $scope.checkAll = !$scope.checkAll;
            _.forEach($scope.pagedItemsPerson[$scope.currentPagePerson], function (grouping) {
                if (grouping.inInclude || grouping.inOwner) {
                    grouping.isSelected = $scope.checkAll;
                    grouping.includeIsSelected = $scope.checkAll;
                    grouping.ownerIsSelected = $scope.checkAll;
                }
            });
            if ($scope.checkAll) {
                count = totalCheckBoxCount;
            } else {
                count = 0;
            }
        };

        $scope.updateCheckInclude = function (grouping) {

            if (grouping.includeIsSelected) {
                if (grouping.ownerIsSelected || !grouping.inOwner) {
                    grouping.isSelected = true;
                }
                count = count + 1;
            } else {
                count = count - 1;
            }

            if (!grouping.ownerIsSelected || !grouping.includeIsSelected) {
                grouping.isSelected = false;
            }

            $scope.checkAll = (count === totalCheckBoxCount);

            console.log("Count: " + count + ", Total: " + totalCheckBoxCount);
        };

        $scope.updateCheckOwner = function (grouping) {

            if (grouping.ownerIsSelected) {
                if (grouping.includeIsSelected || !grouping.inInclude) {
                    grouping.isSelected = true;
                }
                count = count + 1;
            } else {
                count = count - 1;
            }

            if (!grouping.ownerIsSelected || !grouping.includeIsSelected) {
                grouping.isSelected = false;
            }

            $scope.checkAll = (count === totalCheckBoxCount);

            console.log("Count: " + count + ", Total: " + totalCheckBoxCount);
        };

        $scope.updateCheckAll = function (grouping) {
            if (grouping.isSelected) {
                grouping.ownerIsSelected = true;
                grouping.includeIsSelected = true;
                count = count + 1;
            } else {
                grouping.ownerIsSelected = false;
                grouping.includeIsSelected = false;
                count = count - 1;
            }

            $scope.checkAll = (count === totalCheckBoxCount);

            console.log("Count: " + count + ", Total: " + totalCheckBoxCount);
        };


        /**
         * Adds a user to the admin list.
         */
        $scope.addAdmin = function () {
            groupingsService.getAdminLists(function () {
                const adminToAdd = $scope.adminToAdd;

                if (_.isEmpty(adminToAdd)) {
                    $scope.createAddErrorModal(adminToAdd);
                } else {
                    $scope.createConfirmAddModal({
                        userToAdd: adminToAdd,
                        listName: "admins"
                    });
                }
            }, function (res) {
                if (res.statusCode === 403) {
                    $scope.createRoleErrorModal();
                }
            });
        };

        /**
         * Removes an admin from the admin list. There must be at least one admin remaining.
         * @param {number} currentPage - the current page in the admins list
         * @param {number} index - the index of the admin to delete, with the current page and items per page taken into
         * account
         */
        $scope.removeAdmin = function (currentPage, index) {
            groupingsService.getAdminLists(function () {
                const adminToRemove = $scope.pagedItemsAdmins[currentPage][index];

                if ($scope.adminsList.length > 1) {
                    $scope.createRemoveModal({
                        user: adminToRemove,
                        listName: "admins"
                    });
                } else {
                    const userType = "admin";
                    $scope.createRemoveErrorModal(userType);
                }
            }, function (res) {
                if (res.statusCode === 403) {
                    $scope.createRoleErrorModal();
                }
            });
        };

        /**
         * Copies grouping path to clipboard.
         */
        $scope.copyPath = function (grouping) {
            var copyText = document.getElementById(grouping.path);
            copyText.select();
            document.execCommand("copy");
        };
    }

    UHGroupingsApp.controller("AdminJsController", AdminJsController);

}());
