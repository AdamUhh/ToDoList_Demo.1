$(document).ready(function() {

  var data = JSON.parse(localStorage.getItem("todoData"));
  var cardData = JSON.parse(localStorage.getItem("todoCardData"));
  var groupData = JSON.parse(localStorage.getItem("todoGroupData"));
  var sortedGroupData = JSON.parse(localStorage.getItem("todoSortedGroupData"));


  data = data || {};

  cardData = cardData || {};

  groupData = groupData || {};

  sortedGroupData = sortedGroupData || [];

  var currentGroup;
  var currentCard;
  var counter = 0;


  $(function() {

    $.each(sortedGroupData, function(index, tempGroupData) {
      // console.log(tempGroupData);
      if (tempGroupData){
        currentGroup = "group_"+tempGroupData; //set current group
        generateGroup(groupData["group_"+tempGroupData])
      } else
        return false;
      $.each(groupData["group_"+tempGroupData].containsCards, function(index, tempCardData) {
        // console.log(tempCardData);
        if (tempCardData){
          generateCard(cardData["card_" + tempCardData]);
          currentCard = cardData["card_" + tempCardData].id;
          $.each(cardData["card_"+tempCardData].containsTasks, function(index, tempData){
            if (tempData == "")
              return;
            generateElement(data["task_" + tempData])

          }); //end of for each tempCardData.containsTasks loop
        } //end of if statement

      }); //end of for each tempGroupData.containsCards loop
      $("#group_" + tempGroupData).css({"background-color":  groupData[currentGroup].color});
      return false; //currently selected group changes color to black

    }); //end of for each sortedgroupData loop

    $.each(sortedGroupData, function(index, tempGroupData) {
      if (counter === 0){
        counter++;
        return;
      }
      generateGroup(groupData["group_"+tempGroupData])
    }); //end of for each sortedGroupData loop

    StepByStepProcess();
    enableSplitButton();
    enableCardSort();
    enableGroupSort();
    enableTaskSort();
    startup();



    $("#delete-div-tasks").droppable({
      drop: function(event, ui) {
        var id = ui.draggable.attr("id");
        // console.log(id);
        // Removing old element
        $(ui.draggable).remove();

        // Updating local storage
        delete data[id];
        localStorage.setItem("todoData", JSON.stringify(data));

        // Hide Delete Area
        $("#delete-div").hide();
      } //end of drop
    }) //end of droppable delete-div-tasks

    $("#delete-div-cards").droppable({
      drop: function(event, ui) {
        var cardID = ui.draggable.attr("id");
        // console.log(cardID);

        // Removing old element
        $(ui.draggable).remove();

        $.each(cardData[cardID].containsTasks, function(index, taskID) {
          if (taskID){
            delete data["task_"+taskID];
            localStorage.setItem("todoData", JSON.stringify(data));
          }
        }); //end of for each Data

        // Updating local storage
        delete cardData[cardID];
        localStorage.setItem('todoCardData', JSON.stringify(cardData));

        currentCard = "card_" + groupData[currentGroup].containsCards[groupData[currentGroup].containsCards.length-2];
        if (currentCard == 'card_undefined')
          currentCard = '';
        StepByStepProcess();
        // Hide Delete Area
        $("#delete-div").hide();
      } //end of drop
    }) //end of droppable delete-div-cards

    $("#delete-div-groups").droppable({
      drop: function(event, ui) {
        var groupID = ui.draggable.attr("id");

        $(ui.draggable).remove();

        $.each(groupData[groupID].containsCards, function(index, cardID){
          if (!cardID)
            return false;
          $.each(cardData["card_"+cardID].containsTasks, function(index, taskID) {
            if (taskID){
              delete data["task_"+taskID];
              localStorage.setItem("todoData", JSON.stringify(data));
            }
          }); //end of for each fData
          delete cardData["card_"+cardID]
          localStorage.setItem('todoCardData', JSON.stringify(cardData));
          $('#card_'+cardID).remove();
        }); //end of for each groupData containsCards loop

        delete groupData[groupID]
        localStorage.setItem('todoGroupData', JSON.stringify(groupData));

        $('.container-group-area').css({"background-color": "transparent"});


        currentGroup = '';
        currentCard= '';
        StepByStepProcess();
      } //end of drop
    }); //end of droppable delete-div-groups

  }); //end of initialization


  $(document.body).on('click', '#addTaskBtn', function () {
        var inputs = $("#todo-form" + " :input"),
            errorMessage = "Title or description can not be empty",
            id, title, description, date, tempData;

        title = inputs[0].value;
        description = inputs[1].value;
        date = inputs[2].value;

        if (!title && !description) {
            alert(errorMessage);
            return;
        }

        id = new Date().getTime();

        tempData = {
            id : "task_" + id,
            cardID: currentCard,
            title: title,
            date: date,
            description: description,
            color: '#fff'
        };

        // Generate Todo Element
        generateElement(tempData);
        $('.task-container').trigger('sortupdate'); //don't remove as you need first update
        // Reset Form
        inputs[0].value = "";
        inputs[1].value = "";
        inputs[2].value = "";

        enableSplitButton();
        enableTaskSort();
    }); //end of addTask

  $(document.body).on('click', '#addCardBtn', function () {
      var inputs = $("#todo-form" + " :input"),
      errorMessage = "Card Title can not be empty",
      cardID, cardTitle;

      cardTitle = inputs[4].value;

      cardID = new Date().getTime()

      var tempCardData = {
        id : "card_" + cardID,
        cardTitle : cardTitle,
        containsTasks : [''],
        color: '#e3e3e3',
      };

      generateCard(tempCardData);
      $('.task-container').trigger('sortupdate'); //don't remove as you need first update

      currentCard = "card_" + cardID;

      StepByStepProcess();
      enableSplitButton();
      enableTaskSort();
      enableCardSort();
      inputs[4].value = "";
    }); //end of addCard


  $(document.body).on('click', '#addGroupBtn', function () {
      var inputs = $(".add-group-area" + " :input"),
      errorMessage = "Group Title can not be empty",
      groupID, groupTitle;

      groupTitle = inputs[0].value;

      groupID = new Date().getTime();

      var tempGroupData = {
        id : "group_" + groupID,
        groupTitle : groupTitle,
        containsCards : [''],
        color: "#fff"
      };

      currentGroup = "group_" + groupID;
      $('.task-container').remove();

      generateGroup(tempGroupData);
      $('#contain-group-area').trigger('sortupdate'); //don't remove as you need first update

      inputs[0].value = "";

      $('.container-group-area').css({"background-color": "transparent"});
      $('#'+currentGroup).css({"background-color": groupData[currentGroup].color});

      currentCard= '';
      StepByStepProcess();
      enableSplitButton();
    }); //end of addGroup

  $(document.body).on('click', '.openGroupBtn', function () {
      var groupID = $(this).attr("id");
      currentGroup = groupID;
      $('.task-container').remove();

      $.each(groupData[groupID].containsCards, function(index, tempCardData){
        if (tempCardData == "") { //if there are no cards
          currentCard = ''
          return false;
        }
        generateCard(cardData["card_"+tempCardData])
        currentCard = "card_" + tempCardData;
        $.each(cardData["card_"+tempCardData].containsTasks, function(index, tempData){
          if (tempData == "") //if there are no tasks
            return false;
          generateElement(data["task_"+tempData])
        })//for each cardData loop
      }); //for each groupData loop

      $('.container-group-area').css({"background-color": "transparent"});
      $(this).parent().css({"background-color":  groupData[currentGroup].color});

      enableSplitButton();
      StepByStepProcess();
      enableTaskSort();
  }); //end of groupAreaBtn









  var generateElement = function(task) {
    var parent = "#" + task.cardID,
        wrapper;

    if (!parent)
      return;

    wrapper = $("<div />", {
            "class" : 'todo-task',
            "id" :  task.id,
            "data" : task.position
            }).appendTo(parent);

            $("<div />", {
                "class" : 'task-header',
                "text": task.title
            }).appendTo(wrapper);

            $("<div />", {
              "class" : 'task-description',
              "text": task.description
          }).appendTo(wrapper);

            $("<div />", {
                "class" : 'task-date',
                "text": task.date
            }).appendTo(wrapper); //end of wrapper

            $('<select />', {
              "id" : "taskSelect",
              "class" : task.id + " groupSelect"
            }).append($('<option /> ', {
              "value" : "rename",
              "text" : "Rename"
            })).append($('<option /> ', {
              "value" : "color",
              "text" : "Change Color"
            })).appendTo(wrapper);
        if (task.color != "#fff")
          wrapper.css('background-color', task.color);

      // Saving element in local storage
      data[task.id] = task;
      localStorage.setItem("todoData", JSON.stringify(data));

  } //end of generateElement

  var generateCard = function(card) {
    var parent = $('#center-container'),
        wrapper;

    wrapper = $("<div />", {
            "class" : "task-list task-container",
            "id" : card.id
          }).appendTo(parent);

          $("<h3 />", {
            "class" : 'h3-container',
            "text" : card.cardTitle
          }).appendTo(wrapper);

          $('<select />', {
            "id" : "cardSelect",
            "class" : card.id + " groupSelect"
          }).append($('<option /> ', {
            "value" : "rename",
            "text" : "Rename"
          })).append($('<option /> ', {
            "value" : "color",
            "text" : "Change Color"
          })).appendTo(wrapper);
      if (card.color != "#e3e3e3")
        wrapper.css('background-color', card.color).css('box-shadow', '0px 0px 0px 4px ' + card.color);

    // Saving element in local storage
    cardData[card.id] = card;
    localStorage.setItem("todoCardData", JSON.stringify(cardData));

  } //end of generateCard

  var generateGroup = function(group) {
    var parent = $('#contain-group-area'),
        wrapper;

    wrapper = $("<div />", {
                "class" : "container-group-area",
                "id" : group.id,
              }).appendTo(parent);

              $("<div />", { //<input />
                // "type" : "button",
                "class" : "openGroupBtn",
                "id" : group.id,
                "value" : group.groupTitle,
                "text" : group.groupTitle
              }).appendTo(wrapper);

              $('<select />', {
                "id" : "groupSelect",
                "class" : group.id + " groupSelect"
              }).append($('<option /> ', {
                "value" : "rename",
                "text" : "Rename"
              })).append($('<option /> ', {
                "value" : "color",
                "text" : "Change Color"
              })).appendTo(wrapper);

        if (group.color != "#fff")
          $('#'+group.id + '.openGroupBtn').css('background-color', group.color);


    groupData[group.id] = group;
    localStorage.setItem("todoGroupData", JSON.stringify(groupData));

  } //end of generateGroup


  function enableTaskSort() {

    $('.task-container').sortable( {

      connectWith: '.task-container',
      items: '.todo-task',

      start: function(event, ui){
        $("#delete-div-tasks").show();
      },//end of start

      stop: function(event, ui) {
        $("#delete-div-tasks").hide();
      }, //end of stop
    }); //end of sortable


    $('.task-container').on('sortupdate', function(event, ui) {
      var parent = ($(this).attr('id'));
      // console.log(parent + ' updater');
      var sortedIDs = ($(this).sortable("serialize")).substring(7).split('&task[]=');
      // console.log(sortedIDs);
      cardData[parent].containsTasks = sortedIDs;

      // console.log(sortedIDs);

      $.each(sortedIDs, function(index, IDvalue){

          if (data["task_"+IDvalue]) {
            var object = data["task_"+IDvalue];
            object.cardID = parent;
            data["task_"+IDvalue] = object;
            localStorage.setItem('todoData', JSON.stringify(data));
          }
      }); //end of for each IDvalue loop
      localStorage.setItem('todoCardData', JSON.stringify(cardData));



    }).disableSelection(); //end of sortupdate

  } //end of enableTaskSort()

  function enableCardSort() {

    $('#center-container').sortable({
      start: function(event, ui){
        $("#delete-div-cards").show();
      },//end of start
      stop: function(event, ui) {
        $("#delete-div-cards").hide();
      }, //end of stop
    });//end of sortable

    $('#center-container').on('sortupdate', function(event, ui) {
      // var parent = ($(this).attr('id'));
      // console.log(parent + ' updateing');
      var sortedCardIDs = ($(this).sortable("serialize")).substring(7).split('&card[]=');
      // console.log(sortedCardIDs);        enableSplitButton();


      groupData[currentGroup].containsCards = sortedCardIDs;
      localStorage.setItem("todoGroupData", JSON.stringify(groupData));


    }).disableSelection(); //end of sortupdate

  } //end of enableCardSort

  function enableGroupSort() {
    $('#contain-group-area').sortable({
      cancel: '', //allows for sorting on buttons themselves
      start: function(event, ui){
        $("#delete-div-groups").show();
      },//end of start
      stop: function(event, ui) {
        $("#delete-div-groups").hide();
      }, //end of stop
    });//end of sortable

    $('#contain-group-area').on('sortupdate', function(event,ui) {

      var sortedGroupIDs = ($(this).sortable("serialize")).substring(8).split('&group[]=');
      // console.log(sortedGroupIDs)

      localStorage.setItem("todoSortedGroupData", JSON.stringify(sortedGroupIDs));

      StepByStepProcess();
    }); //end of sortupdate


  } //end of enableGroupSort


  function StepByStepProcess() {
    if (currentGroup){
      $('#add-task-div').show();

      if (currentCard){
        $('#taskTitleInputBox').show();
        $('#taskDescriptionInputBox').show();
        $('#datepicker').show();
        $('#addTaskBtn').show();
        $('#titleNameTask').show();

      } else {
        $('#taskTitleInputBox').hide();
        $('#taskDescriptionInputBox').hide();
        $('#datepicker').hide();
        $('#addTaskBtn').hide();
        $('#titleNameTask').hide();
      }
    } else {
      $('#add-task-div').hide();
    }
  } //end of StepByStepProcess





  $('#taskTitleInputBox').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      $('#addTaskBtn').click();
      return false;
    } //end of if statement
  }); //end of groupInputBox.keypress

  $('#taskDescriptionInputBox').keypress(function(e){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){

    }

  }); //end of taskDescriptionInputBox

  $('#cardTitleInputBox').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      $('#addCardBtn').click();
      return false;
    } //end of if statement
  }); //end of groupInputBox.keypress

  $('#groupInputBox').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      $('#addGroupBtn').click();
      return false;
    } //end of if statement
  }); //end of groupInputBox.keypress


  function enableSplitButton() {

    $( ".groupSelect" ).selectmenu({
      classes: {
        "ui-selectmenu-button": "ui-button-icon-only demo-splitbutton-select"
      },
      select: function(){
        var id = ($(this).parent().attr('id')),
            selectedItem = $("#" + id).find(".ui-selectmenu-text").first(".ui-selectmenu-text").text();
            if (id[0] === 'g'){
              if (selectedItem == 'Rename'){
                $('#rename-box').prop('value', groupData[id].groupTitle);
                $( "#main-rename-dialog" ).data('id', id).dialog('open');
              } else if (selectedItem == 'Change Color') {
                $( "#color-dialog" ).data('id', id).dialog('open');
              } //end of if else statement for g
            } //end of if g statement

        if (id[0] === 'c'){
          if (selectedItem == 'Rename'){
            $('#rename-box').prop('value', cardData[id].cardTitle);
            $( "#main-rename-dialog" ).data('id', id).dialog('open');
          } else if (selectedItem == 'Change Color') {
            $( "#color-dialog" ).data('id', id).dialog('open');
          } //end of if else statement for c

        } //end of if c statement

        if (id[0] === 't'){
          if (selectedItem == 'Rename') {
            $('#task-title-rename-box').prop('value', data[id].title);
            $('#task-description-rename-box').prop('value', data[id].description);
            $('#task-date-rename-box').prop('value', data[id].date);
            $( "#task-rename-dialog" ).data('id', id).dialog('open');
          }
          else if (selectedItem == 'Change Color') {
            $( "#color-dialog" ).data('id', id).dialog('open');
          } //end of if else statement for t
        } //end of if t statement

      } //end of select

    }); //end of selectmenu
    $( ".controlgroup" ).controlgroup();


  } //end of enableSplitButton



  $( "#main-rename-dialog" ).dialog({
    modal: true,
    autoOpen: false,
    height: 255,
    width: 300,
    buttons: {
        "Rename Group": function() {
          var id = ($(this).data('id'));
          if (id[0] === 'g'){
            $('#' + id + " .openGroupBtn").html($("#rename-box")[0].value); //).value('text', )
            groupData[id].groupTitle = $("#rename-box")[0].value;
            localStorage.setItem("todoGroupData", JSON.stringify(groupData));

          } else if (id[0] === 'c') { //end of if g
            $('#' + id).find('.h3-container').html($("#rename-box")[0].value);
            cardData[id].cardTitle = $("#rename-box")[0].value;
            localStorage.setItem("todoCardData", JSON.stringify(cardData));
          }
          $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
    },
  }); //end of group/card-rename-dialog dialog box

  $( "#task-rename-dialog" ).dialog({
    modal: true,
    autoOpen: false,
    height: 255,
    width: 300,
    buttons: {
        "Rename Group": function() {
          var id = ($(this).data('id'));
              inputs = $('#' + id).find('div');
          $(inputs[0]).html($("#task-title-rename-box")[0].value);
          $(inputs[1]).html($("#task-description-rename-box")[0].value);
          $(inputs[2]).html($("#task-date-rename-box")[0].value);

          data[id].title = $("#task-title-rename-box")[0].value;
          data[id].date = $("#task-date-rename-box")[0].value;
          data[id].description = $("#task-description-rename-box")[0].value;
          localStorage.setItem("todoData", JSON.stringify(data));

          $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
    },
  }); //end of group-rename-dialog dialog box

  $( "#color-dialog" ).dialog({
    modal: true,
    autoOpen: false,
    height: 255,
    width: 300,
    buttons: {
        "Change Color": function() {
          var id = ($(this).data('id'));
          if (id[0] === 'g'){
            $('#'+id + '.openGroupBtn').css('background-color', colorWell.value);
            if (currentGroup == id)
              $('#'+id).css('background-color', colorWell.value);
            groupData[id].color = colorWell.value;
            localStorage.setItem("todoGroupData", JSON.stringify(groupData));
          }

          if (id[0] === 'c'){
            $('#'+id).css('background-color', colorWell.value).css('box-shadow', '0px 0px 4px' + colorWell.value);
            cardData[id].color = colorWell.value;
            localStorage.setItem("todoCardData", JSON.stringify(cardData));
          }
          if (id[0] === 't'){
            $('#'+id).css('background-color', colorWell.value);
            data[id].color = colorWell.value;
            localStorage.setItem("todoData", JSON.stringify(data));
          }

          $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
    },
  }); //end of color-dialog box

  $( "#cleardata-dialog" ).dialog({
    modal: true,
    autoOpen: false,
    height: 255,
    width: 300,
    buttons: {
        "Clear Data": function() {

          window.localStorage.clear();
          data = {};
          cardData = {};
          groupData = {};
          sortedGroupData = [];
          $('.task-container').remove();
          $('.container-group-area').remove();

          $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
    },
  }); //end of cleardata dialog box


}); //end of document.ready()
var colorWell;
var defaultColor = "#874FA1";

function startup() {
  colorWell = document.querySelector("#colorWell");
  colorWell.value = defaultColor;
  colorWell.select();
}
