var str = JSON.parse(localStorage.getItem("str-array"));
var str_hyphens = JSON.parse(localStorage.getItem("str-hyphens-array"));
var arr = JSON.parse(localStorage.getItem("arr-array"));
// The key is an id (a single line number starting from 0)
var key = JSON.parse(localStorage.getItem("search_result"));
// var ifSubtree = JSON.parse(localStorage.getItem("ifSubtree"));

// ifSearch will become yes only after the user first search the node 
// This can prevent the tree.html from auto-selecting the answers even though the user just left the index page. 
var ifSearch = JSON.parse(localStorage.getItem("ifSearch"));

// var error = JSON.parse(localStorage.getItem("error"));
var Diagram = MindFusion.Diagramming.Diagram;
var DiagramLink = MindFusion.Diagramming.DiagramLink;
var ControlNode = MindFusion.Diagramming.ControlNode;

var Rect = MindFusion.Drawing.Rect;
var Point = MindFusion.Drawing.Point;

var Animation = MindFusion.Animations.Animation;
var AnimationType = MindFusion.Animations.AnimationType;
var EasingType = MindFusion.Animations.EasingType;
var AnimationEvents = MindFusion.Animations.Events;
// The bx and by control the size of the box.
// var bx = 65, by = 25;
var bx = 87, by = 30;

var currId = 0;
var currOriginNode = null;

window.setInterval(checkRadioButton, 1000);
let ifNewInput = '';
let ifClickedRadio = false;
if(ifSearch == 'yes' ) {
    ifNewInput = 'no';
}
else if(ifSearch == 'no') {
    ifNewInput = 'yes';
}

let root_key_id = [];
let path_subtree = []; 
let pathAndSubtree = [];
let currTreeIdList = [];
var index = 2; // for auto selecting the answers according to path, it is used in the next option function
rootNode();

// rootNode generates the root node
// rootNode is called whenever the page is loaded
// No input or output
function rootNode() {
    currTreeIdList.push(0);
    diagram = Diagram.create(document.getElementById("diagram"));
    var Behavior = MindFusion.Diagramming.Behavior;
    diagram.setBehavior(Behavior.SelectOnly);
    // diagram.setBounds(new Rect(0, 0, 500, 500));
    diagram.setVirtualScroll(true);
    // create an Overview component that wraps the "overview" canvas
    // var overview = MindFusion.Diagramming.Overview.create(document.getElementById("overview"));
    // overview.setDiagram(diagram);

    // create an ZoomControl component that wraps the "zoomer" canvas
    var zoomer = MindFusion.Controls.ZoomControl.create(document.getElementById("zoomer"));
    zoomer.setTarget(diagram);

    var defaultTemplate = `
		<p>Choose a state:<p>
		<div><select data-interactive="true" data-event-change="selectClick" name="states" id="states">
		<option value="none" selected></option>
		<option value="Ohio">India</option>
		<option value="South Dakota">South Dakota</option>
		<option value="Washington">Washington</option>
		<option value="Texas">Texas</option>
		</select>
		</div>`;

    // diagram.setDefaultControlTemplate(defaultTemplate);

    var id = 0;
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var len = str[id].search(',');
    let s = str[0].substring(len + 1, str[0].length);


    // detect if the text contains link and add hypertext reference to the link
    // WE WANT TO BE ABLE TO POPULATE TREE NOT LINK EXTERNAL TREE
    let s_len = s.search("https");
    let link = s.substring(s_len, s.length);
    if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;
            }
    
    // Shrink the node if the text is small. 
    if(s.length < 40) {
        by = 22;
        // document.getElementById('d1').style.paddingBottom = '0px';
    }
    else {
        by = 30;
        // document.getElementById('d1').style.paddingBottom = '25px';
    }

    if (arr[id].length > 0 && arr[id].length <= 5) {
        var val = `<div id="d1"><p>` + s + `</p></div>` + `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
        
        for (var i = 0; i < arr[id].length; i++) {

            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
        }
        val += `<option value="NotSure">NotSure</option>`;
        val += `</select></div>`;
    }
    else if(arr[id].length > 5) {
        var val = `<div id="d1"><p>` + s + `</p></div>`;
        
        for (var i = 0; i < arr[id].length; i++) {
            len1 = str[arr[id][i]].search(',');
            s1 = str[arr[id][i]].substring(3, len1);
            val += '<input type="checkbox" name="topics" value="' + arr[id][i] + '" />' + s1 + '<br />';                    
        }

        val += '<button class="btn btn-primary" onclick="selectClick()">Submit</button>';
    }
    
    // console.log("check val: " + val);
    node.setTemplate(val);
    node.setBounds(new Rect(40, 10, bx, by));
    node.setId(id);
    diagram.addItem(node);
    diagram.resizeToFitItems(10);


    // printing and saving the path from root to keyword node
    if(ifSearch == 'yes') {
        findPath(0, root_key_id, key);
        let root_key = [];
        for(let i = 0; i < root_key_id.length; i++) {
            root_key.push(str_hyphens[root_key_id[i]]);
            pathAndSubtree.push(root_key_id[i]);
        }

 
        console.log("search path (from root to keyword): ");
        for(let i = 0; i < root_key.length; i++) {
            console.log(root_key[i] + '\n');
        }
        
        // for passing values to python
        let root_key_dic = Object.assign({}, root_key);
        const s_test = JSON.stringify(root_key_dic);
        $.ajax({
            url:"/root_to_keyword",
            type:"POST",
            contentType:"application/json",
            data: JSON.stringify(s_test),
        });
        console.log("subtree: ");

        // get subtree
        subtree(true, key); // this function will fill up the path_subtree

        let path_subtree_dic = Object.assign({}, path_subtree );
        const s2 = JSON.stringify(path_subtree_dic);
        $.ajax({
            url:"/get_subtree",
            type:"POST",
            contentType:"application/json",
            data: JSON.stringify(s2),
        });
        
        // else {
        //     console.log("other nodes: ");
        //     subtree(ifSubtree, key); //you need to store the subtree id in the list pathAndSubtree.

        //     let other = [];
        //     for(let i = 0; i < str_hyphens.length; i++) {
        //         if(pathAndSubtree.includes(i) == false) {
        //             console.log(str_hyphens[i]);
        //             other.push(str_hyphens[i]);
        //         }
        //     }

        //     let other_dic = Object.assign({}, other );
        //     const s2 = JSON.stringify(other_dic);
        //     $.ajax({
        //         url:"/get_subtree",
        //         type:"POST",
        //         contentType:"application/json",
        //         data: JSON.stringify(s2),
        //     });
        // }
    
        // console.log("check root_key_id: " + root_key_id);
        // auto select by root_key_id
        $('.select').val(root_key_id[1]);
        selectClick(0, node);

        
        // create new node for the new input file
        // console.log("check s: " + s);
    }
    
    if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
        newInput(link, id);
    }


}


// set root
let root_id = 0;
let path_search = [];

// selectClick is a driver function for 'nextoption' which generates a next box and 'notSure' which generates multple next boxes
// it is called whenver the users select an answer in the drop-down menu.
// It will call 'nextoption' or 'notSure' function
// Input: sender is the current box object
// No output
function selectClick(e, sender) {
    // console.log("reach");
    
    var selectControl = sender.getContent().getElementsByTagName("select")[0];
    deleteNode(sender.id);
    
    if (selectControl.value != "none" && selectControl.value != "NotSure") {
        if(str[selectControl.value] != undefined) {
            nextoption(selectControl.value, sender); 
        }

        //print path from root to current node
        parent = str[sender.id];
        parent_id = sender.id;
        child = str[selectControl.value];
        child_id = selectControl.value;
        if(ifSearch == 'no') {
            printPath(parent_id, child_id, true);
        }
        
    }


    else if (selectControl.value == "NotSure") {
        notSure(sender.id, sender);
        //print path
        parent = str[sender.id];
        parent_id = sender.id;
        printPath(parent_id, -1, false);
    }

}


// nextoption is a function to be called when a single answer in the drop-down menu is selected.
// It is called by the driver function selectClick 
// the function creates and shows a single next box. 
// Input: id is the id of the current box, and originNode is the current box object
// No return output
var allInputs = {};
function nextoption(id, originNode) {
    currTreeIdList.push(parseInt(id));
    let ifCheckbox = false;
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    let len = str[id].search(',');
    let s = str[id].substring(len + 1, str[id].length);
    let curInputKey = "";
    let curInput = "";
    let curInputSubstring = "";
    let userPrompt = "";
    console.log("Current Node: " + s);

    // Syntax: "INPUT: <input prompt> QUERY: <sql query> RETURN: <result string - with 'RESULT' to be replaced by the result of the query>"
    if (s.includes("QUERY:") && s.includes("RETURN:")) {
    //     if (s[s.length - 1] == '?'){
    //         s = s.substring(0, s.length - 1)
    //     } 
        // extracts input substrings from line based on and stores each in the list inputSubstrings
        if (s.includes("INPUT")) {
            let regex = /(INPUT\d+: .*?)(?= INPUT\d+:| QUERY:|$)/g;
            let inputSubstrings = s.match(regex) || [];

            console.log("inputSubstrings: " + inputSubstrings);
            for (let i = 0; i < inputSubstrings.length; i++) {
                curInputKey = inputSubstrings[i].substring(0, inputSubstrings[i].search(":"));
                curInput = prompt(inputSubstrings[i].substring(inputSubstrings[i].search(":") + 1));
                // forces user to enter input
                while (typeof curInput == 'undefined' || curInput == null) {
                        curInput = prompt(inputSubstrings[i].substring(inputSubstrings[i].search(":") + 1));
                }
                allInputs[curInputKey] = curInput;
            }
        }

        // curInputKey = s.substring(s.search("INPUT"), s.search(":"));
        // console.log("curInputKey: " + curInputKey);

        // if (s.search("INPUT") != -1) {
        //     userPrompt = s.substring(s.search(":") + 1, s.substring(s.search(":") + 1), + s.search("INPUT"));
        // }
        // else{
        //     userPrompt =s.substring(s.search(":") + 1, s.search("QUERY:"));
        // }
        // userInput = prompt(userPrompt);
        // while (typeof userInput == 'undefined' || userInput == null) {
        //     userInput = prompt(userPrompt);
        // }



            
        // allInputs.push(userInput);
        let query = s.substring(s.search("QUERY:") + 7);
        let resultStr = "";

        if (s.includes("RETURN:")) {
            query = query.substring(0, query.search("RETURN:"));
            resultStr = s.substring(s.search("RETURN:") + 7);
        }

        // Send the input to the server
        $.ajax({
            url: "/input_query_return",
            type: "POST",
            contentType: "application/json",
            async: false,
            data: JSON.stringify({"query": query, "allInputs": allInputs, "resultStr": resultStr}),
            success: function(response) {
                s = response.toString();
                console.log("s: " + s + s.toString());
            },
            error: function(request){
                console.log("Error executing query.");
                $("#debug").html(request.responseText);
                $("#debug").html("5566");
            }
        });
    }

                
    
    // detect if the text contains link and add hypertext reference to the link
    let s_len = s.search("https");
    let link = s.substring(s_len, s.length);
    if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
        let link_ref = '<a href="' + link + '" target="_blank">' + link + '</a>';
        s = s.substring(0, s_len) + link_ref;
    }

    // Shrink the node if the text is small. 
    if(s.length < 40) {
        by = 22;
        // document.getElementById('d1').style.paddingBottom = '0px';
    }
    else {
        by = 30;
        // document.getElementById('d1').style.paddingBottom = '25px';
    }

    // detect and handle sql query
    if(s.includes("SQL")) {
        // We need this myCallback function because the code in ajax runs asynchronously. 
        // We use this function to help receive the result from python
        console.log("Question includes SQL");
        function myCallback(sql_result) {
            console.log("myCallback is running");

            console.log("check sql_result[1]: "  + sql_result[1]);
            
            let sql_result_list = [];
            let hasResult = true;
            while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                let len4 = sql_result[1].indexOf(")");
                if(len3 == -1 || len4 == -1) {
                    hasResult = false;
                    break; // that means there is no result
                }
                let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                console.log("test: " + test);
                sql_result_list.push(test);
                sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                console.log("check sql_result for each loop: " + sql_result[1]);
            }

            if(hasResult == true) {
                console.log("check sql_result_list: " + sql_result_list[0]);
                let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                for(let i = 1; i < sql_result_list.length; i++) {
                    s = s + ', ' + sql_result_list[i][1];
                }
            }
            else if(ifSearch != 'yes'){ 
                // If there is no result
                // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                s = "Sorry, there is no house meeting your need. Please change your answers.";
            }

            console.log("check s in get_sql_result: " + s);
            console.log("check id in nextoption: " + id);
            var val = `<div id="d1"><p>` + s + `</p></div>`;
            if (arr[id].length > 0 && arr[id].length <= 5) {
                val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
                for (var i = 0; i < arr[id].length; i++) {
                    
                    len1 = str[arr[id][i]].search(',');
                    s1 = str[arr[id][i]].substring(3, len1);
                    val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
                }
                val += `<option value="NotSure">NotSure</option>`;
                val += `</select></div>`;
            }
            else if(arr[id].length > 5) {
                ifCheckbox = true;
                val += '<form action="#" method="post" id="checkbox_form"">';
                for (var i = 0; i < arr[id].length; i++) {
                    len1 = str[arr[id][i]].search(',');
                    s1 = str[arr[id][i]].substring(3, len1);
                    val += `<input type="checkbox" name="option" class="checkbox" value="` + arr[id][i] + `" />` + s1 + `<br />`;                    
                }
                // onclick="checkboxAnswers(' + id + ',' + originNode + ');
                val += '<button type="button" id = cb-button class="btn btn-primary" >Submit</button>';
                
                val += '</form>';
            }
            
            node.setTemplate(val);
            node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
            node.setId(id);
            
            node.setLocked(true);
            node.setVisible(true); // I changed it from false to true for auto selecting the answers according to path
            
            diagram.addItem(node);
            createAnimatedLink(originNode, node);
            diagram.resizeToFitItems(10);
        }
        
        get_sql_result(myCallback);

        function get_sql_result(callback) { 
            console.log("get_sql_result function 1 is running");
            let len2 = s.search('SQL:');
            let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
            console.log(query);
            let query_list = [];
            query_list.push(query);
            let query_dic = Object.assign({}, query_list);
            const s2 = JSON.stringify(query_dic);
            $.ajax({
                url:"/get_sql",
                type:"POST",
                contentType:"application/json",
                data: JSON.stringify(s2),
                success: callback,
            });
        }

    }    
    else {
        var val = `<div id="d1"><p>` + s + `</p></div>`;
        if (arr[id].length > 0 && arr[id].length <= 5) {
            val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${id}" class="select" id= "${id}"><option value="none" selected></option>`;
            for (var i = 0; i < arr[id].length; i++) {
                
                len1 = str[arr[id][i]].search(',');
                s1 = str[arr[id][i]].substring(3, len1);
                val += `<option value=` + arr[id][i] + `>` + s1 + `</option>`;
            }
            val += `<option value="NotSure">NotSure</option>`;
            val += `</select></div>`;
        }
        else if(arr[id].length > 5) {
            ifCheckbox = true;
            val += '<form action="#" method="post" id="checkbox_form"">';
            for (var i = 0; i < arr[id].length; i++) {
                len1 = str[arr[id][i]].search(',');
                s1 = str[arr[id][i]].substring(3, len1);
                val += `<input type="checkbox" name="option" class="checkbox" value="` + arr[id][i] + `" />` + s1 + `<br />`;                    
            }
            // onclick="checkboxAnswers(' + id + ',' + originNode + ');
            val += '<button type="button" id = cb-button class="btn btn-primary" >Submit</button>';
        
            
            val += '</form>';
        }
                
        
        
        node.setTemplate(val);
        node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
        node.setId(id);
        
        node.setLocked(true);
        node.setVisible(true); // I changed it from false to true for auto selecting the answers according to path
        
        diagram.addItem(node);
        createAnimatedLink(originNode, node);
        diagram.resizeToFitItems(10);
        
        // submit the checkbox answers
        if(arr[id].length > 5) {
            var o = document.getElementById("cb-button");
            console.log("check o: " + o);
            currId = id;
            currOriginNode = node;
            o.onclick = checkboxAnswers;
        }

        //auto select along the path
        if(arr[id].length !=  0 && ifSearch == 'yes' && index < root_key_id.length) {
            id_str = id.toString();
            $('#' + id_str).val(root_key_id[index]);
            index = index + 1;
            if(ifCheckbox == false) {
                // 0 has no meaning. It is just the 'e' standing for everything
                selectClick(0, node);
            }
            else if(ifCheckbox == true) {
                let results = [];
                results.push(root_key_id[index - 1] - parseInt(id) - 1);
                showCheckbox(id, node, results);
            }
        }

        // create a larger decision tree for the new input file
        if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
            newInput(link, id, false, 0);
            ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
        }
    }



}

// notSure will be called where the user clicks "not sure" in the drop-down menu.
// It is called by the selectClick function
// the funciton creats and shows all answer boxes of the current box. 
// Input: id is the id of the current box, and originNode is the current box object.
// No output
function notSure(id, originNode) {
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var layout = new MindFusion.Graphs.TreeLayout();
    layout.root = node;
    layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
    layout.keepRootPosition = true;
    layout.levelDistance = 33;
    linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;
    if (arr[id].length > 0) {
        for (var i = 0; i < arr[id].length; i++) {
            let node = new MindFusion.Diagramming.ControlNode(diagram);
            let ids = arr[id][i];
            currTreeIdList.push(parseInt(ids));
            let len = str[ids].search(',');
            let s = str[ids].substring(len + 1, str[ids].length);
            console.log("check ids1: " + ids);
            // Shrink the node if the text is small. 
            if(s.length < 40) {
                by = 22;
                // document.getElementById('d1').style.paddingBottom = '0px';
            }
            else {
                by = 30;
                // document.getElementById('d1').style.paddingBottom = '25px';
            }


            // detect if the text contains link and add hypertext reference to the link
            let s_len = s.search("https");
            let dtlink = s.substring(s_len, s.length);
            if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
                let link_ref = '<a href="' + dtlink + '" target="_blank">' + dtlink + '</a>';
                s = s.substring(0, s_len) + link_ref;
            }

            
            // detect and handle sql query
            if(s.includes("SQL")) {
                // We need this myCallback function because the code in ajax runs asynchronously. 
                // We use this function to help receive the result from python
                function myCallback(sql_result) {
                    console.log("check sql_result[1]: "  + sql_result[1]);

                    let sql_result_list = [];
                    let hasResult = true;
                    while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                        let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                        let len4 = sql_result[1].indexOf(")");
                        if(len3 == -1 || len4 == -1) {
                            hasResult = false;
                            break; // that means there is no result
                        }
                        let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                        console.log("test: " + test);
                        sql_result_list.push(test);
                        sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                        console.log("check sql_result for each loop: " + sql_result[1]);
                    }

                    if(hasResult == true) {
                        console.log("check sql_result_list: " + sql_result_list[0]);
                        let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                        let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                        let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                        s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                        for(let i = 1; i < sql_result_list.length; i++) {
                            s = s + ', ' + sql_result_list[i][1];
                        }
                    }
                    else if(ifSearch != 'yes'){ 
                        // If there is no result
                        // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                        // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                        s = "Sorry, there is no house meeting your need. Please change your answers.";
                    }


                    console.log("check s in get_sql_result: " + s);
                    let showResult = str[ids].substring(0, len + 2) + s;
                    let val = `<div id="d1"><p>` + showResult + `</p></div>`;
                    if (arr[ids].length > 0) {
                        val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${ids}" id= "${ids}"><option value="none" selected></option>`;
                        for (var j = 0; j < arr[ids].length; j++) {
    
                            len1 = str[arr[ids][j]].search(',');
                            s1 = str[arr[ids][j]].substring(3, len1);
                            val += `<option value=` + arr[ids][j] + `>` + s1 + `</option>`;
                        }
                        val += `<option value="NotSure">NotSure</option>`;
                        val += `</select></div>`;
                    }
                    node.setTemplate(val);
                    node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
                    // node.setLocked(true);
                    // node.setVisible(true);
                    node.setStroke('#003466');
                    node.setId(ids);
                    diagram.addItem(node);
                    var link = new DiagramLink(diagram, originNode, node);
                    link.setHeadShape('Triangle');
                    link.setHeadBrush('#003466');
                    link.setStroke('#003466');
                    link.setLocked(true);
                    diagram.addItem(link);
                    diagram.arrange(layout);
                    diagram.resizeToFitItems(10);
                    // createAnimatedLink(originNode, node);

                }

                get_sql_result(myCallback);

                function get_sql_result(callback) { 
                    let len2 = s.search('SQL:');
                    let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
                    console.log(query);
                    let query_list = [];
                    query_list.push(query);
                    let query_dic = Object.assign({}, query_list); 
                    console.log("Query dictionary: " + query_dic);
                    const s2 = JSON.stringify(query_dic);
                    $.ajax({
                        url:"/get_sql",
                        type:"POST",
                        contentType:"application/json",
                        data: JSON.stringify(s2),
                        success: callback,
                    });
                }
        
            }    
            else {            
                var val = `<div id="d1"><p>` + str[ids] + `</p></div>`;
                if (arr[ids].length > 0 && arr[id].length <= 5) {
                    val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${ids}" id= "${ids}"><option value="none" selected></option>`;
                    for (var j = 0; j < arr[ids].length; j++) {

                        len1 = str[arr[ids][j]].search(',');
                        s1 = str[arr[ids][j]].substring(3, len1);
                        val += `<option value=` + arr[ids][j] + `>` + s1 + `</option>`;
                    }
                    val += `<option value="NotSure">NotSure</option>`;
                    val += `</select></div>`;
                }
                else if(arr[id].length > 5) {
                    ifCheckbox = true;
                    val += '<form action="#" method="post" id="checkbox_form"">';
                    for (var i = 0; i < arr[id].length; i++) {
                        len1 = str[arr[id][i]].search(',');
                        s1 = str[arr[id][i]].substring(3, len1);
                        val += `<input type="checkbox" name="option" class="checkbox" value="` + arr[id][i] + `" />` + s1 + `<br />`;                    
                    }
                    // onclick="checkboxAnswers(' + id + ',' + originNode + ');
                    val += '<button type="button" id = cb-button class="btn btn-primary" >Submit</button>';
                
                    
                    val += '</form>';
                }
                
                node.setTemplate(val);

                node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
                // node.setLocked(true);
                // node.setVisible(false);
                node.setStroke('#003466');
                node.setId(ids);
                diagram.addItem(node);
                var link = new DiagramLink(diagram, originNode, node);
                link.setHeadShape('Triangle');
                link.setHeadBrush('#003466');
                link.setStroke('#003466');
                link.setLocked(true);
                diagram.addItem(link);
                diagram.arrange(layout);
                diagram.resizeToFitItems(10);
                // createAnimatedLink(originNode, node);

                // submit the checkbox answers
                if(arr[id].length > 5) {
                    var o = document.getElementById("cb-button");
                    console.log("check o: " + o);
                    currId = id;
                    currOriginNode = node;
                    o.onclick = checkboxAnswers;
                }

                // create a larger decision tree for the new input file
                if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
                    console.log("reach decisiontree");
                    newInput(dtlink, id, true, i);
                    ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                }
            }

        }
    }
}

// showCheckbox is called when the current box has more than 5 options
// it creats and shows the multiple next boxes corresponding to the answers of the checkbox
// Input: id is the id of the current box, originNode is the current box object, and results is the list containing the answers of the checkbox
// No ouput
function showCheckbox(id, originNode, results) {
    var node = new MindFusion.Diagramming.ControlNode(diagram);
    var layout = new MindFusion.Graphs.TreeLayout();
    layout.root = node;
    layout.direction = MindFusion.Graphs.LayoutDirection.TopToBottom;
    layout.keepRootPosition = true;
    layout.levelDistance = 10;
    linkType = MindFusion.Graphs.TreeLayoutLinkType.Cascading;
    if (arr[id].length > 0) {
        for (var i = 0; i < arr[id].length; i++) {
            if(results.includes(i)) {
                let node = new MindFusion.Diagramming.ControlNode(diagram);
                let ids = arr[id][i];
                currTreeIdList.push(parseInt(ids));
                let len = str[ids].search(',');
                let s = str[ids].substring(len + 1, str[ids].length);

                // Shrink the node if the text is small. 
                if(s.length < 40) {
                    by = 22;
                    // document.getElementById('d1').style.paddingBottom = '0px';
                }
                else {
                    by = 30;
                    // document.getElementById('d1').style.paddingBottom = '25px';
                }
                
                // detect if the text contains link and add hypertext reference to the link
                // rename link to dtlink(decision tree link) here because we use the name 'link' later for arrows
                let s_len = s.search("https");
                let dtlink = s.substring(s_len, s.length);
                if(s.includes("DOCUMENT") || s.includes("DECISIONTREE")) {
                    let link_ref = '<a href="' + dtlink + '" target="_blank">' + dtlink + '</a>';
                    s = s.substring(0, s_len) + link_ref;
                }
                
                // detect and handle sql query
                if(s.includes("SQL")) {
                    // We need this myCallback function because the code in ajax runs asynchronously. 
                    // We use this function to help receive the result from python
                    function myCallback(sql_result) {
                        console.log("check sql_result[1]: "  + sql_result[1]);

                        let sql_result_list = [];
                        let hasResult = true;
                        while(sql_result[1].length > 9) { // > 9 because we have \n <\div> in the end
                            let len3 = sql_result[1].indexOf("("); // the data is in data[1] instead of data[0] for some reason
                            let len4 = sql_result[1].indexOf(")");
                            if(len3 == -1 || len4 == -1) {
                                hasResult = false;
                                break; // that means there is no result
                            }
                            let test = sql_result[1].substring(len3 + 1, len4).split(', ');
                            console.log("test: " + test);
                            sql_result_list.push(test);
                            sql_result[1] = sql_result[1].substring(len4 + 1, sql_result[1].length);
                            console.log("check sql_result for each loop: " + sql_result[1]);
                        }

                        if(hasResult == true) {
                            console.log("check sql_result_list: " + sql_result_list[0]);
                            let ifPlural1 = sql_result_list.length > 1 ? "houses " : "house ";
                            let ifPlural2 =  sql_result_list.length > 1 ? "meet " : "meets ";
                            let ifPlural3 =  sql_result_list.length > 1 ? "are " : "is ";
                            s = "The " + ifPlural1 + ifPlural2 +  "your need " + ifPlural3 + ": " + sql_result_list[0][1];
                            for(let i = 1; i < sql_result_list.length; i++) {
                                s = s + ', ' + sql_result_list[i][1];
                            }
                        }
                        else if(ifSearch != 'yes'){ 
                            // If there is no result
                            // ifSearch != 'yes' because when users search sql command in the node, the desire answer should not be the string below.
                            // this can be trivial because users usually don't want to search the sql command which will be replaced with more readable string answers. 
                            s = "Sorry, there is no house meeting your need. Please change your answers.";
                        }


                        console.log("check s in get_sql_result: " + s);

                        // str[ids]
                        // var val = `<div id="d1"><p>` + s + `</p></div>`;
                        let showResult = str[ids].substring(0, len + 2) + s;
                        let val = `<div id="d1"><p>` + showResult + `</p></div>`;
                        if (arr[ids].length > 0) {
                            val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${ids}" id= "${ids}"><option value="none" selected></option>`;
                            for (var j = 0; j < arr[ids].length; j++) {
                                len1 = str[arr[ids][j]].search(',');
                                s1 = str[arr[ids][j]].substring(3, len1);
                                val += `<option value=` + arr[ids][j] + `>` + s1 + `</option>`;
                            }
                            val += `<option value="NotSure">NotSure</option>`;
                            val += `</select></div>`;
                        }
                                                node.setTemplate(val);

                        node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
                        // node.setLocked(true);
                        // node.setVisible(false);
                        node.setStroke('#003466');
                        node.setId(ids);
                        diagram.addItem(node);
                        var link = new DiagramLink(diagram, originNode, node);
                        link.setHeadShape('Triangle');
                        link.setHeadBrush('#003466');
                        link.setStroke('#003466');
                        link.setLocked(true);
                        diagram.addItem(link);
                        // createAnimatedLink(originNode, node);
                        diagram.arrange(layout);
                        diagram.resizeToFitItems(10);
                    }

                    get_sql_result(myCallback);

                    function get_sql_result(callback) { 
                        console.log("get_sql_result function 2 is running");
                        let len2 = s.search('SQL:');
                        let query = s.substring(len2 + 5, s.length); // plus 5 to skip 'SQL: ' 
                        console.log(query);
                        let query_list = [];
                        query_list.push(query);
                        let query_dic = Object.assign({}, query_list);
                        const s2 = JSON.stringify(query_dic);
                        $.ajax({
                            url:"/get_sql",
                            type:"POST",
                            contentType:"application/json",
                            data: JSON.stringify(s2),
                            success: callback,
                        });
                    }
                }
                else {
                    var val = `<div id="d1"><p>` + str[ids] + `</p></div>`;
                    if (arr[ids].length > 0) {
                        val += `<div><select data-interactive="true" data-event-change="selectClick" name= "${ids}" id= "${ids}"><option value="none" selected></option>`;
                        for (var j = 0; j < arr[ids].length; j++) {
                            len1 = str[arr[ids][j]].search(',');
                            s1 = str[arr[ids][j]].substring(3, len1);
                            val += `<option value=` + arr[ids][j] + `>` + s1 + `</option>`;
                        }
                        val += `<option value="NotSure">NotSure</option>`;
                        val += `</select></div>`;
                    }
                                        node.setTemplate(val);

                    node.setBounds(new Rect(originNode.getBounds().x, originNode.getBounds().y + 60, bx, by));
                    // node.setLocked(true);
                    // node.setVisible(false);
                    node.setStroke('#003466');
                    node.setId(ids);
                    diagram.addItem(node);
                    var link = new DiagramLink(diagram, originNode, node);
                    link.setHeadShape('Triangle');
                    link.setHeadBrush('#003466');
                    link.setStroke('#003466');
                    link.setLocked(true);
                    diagram.addItem(link);
                    // createAnimatedLink(originNode, node);
                    diagram.arrange(layout);
                    diagram.resizeToFitItems(10);

                    // create a larger decision tree for the new input file
                    if(s.includes("DECISIONTREE") && ifNewInput == 'yes') {
                        console.log("reach decisiontree");
                        newInput(dtlink, id, true, i);
                        ifNewInput = JSON.parse(localStorage.getItem("ifNewInput"));
                    }
                
                }

            }
        }
    }
}

// This function can show animated link
// Input: originNode is the current box object, and node is the next node object
// No return output
function createAnimatedLink(originNode, node) {
    var link = new DiagramLink(diagram, originNode, node);
    link.setHeadShape('Triangle');
    link.setHeadBrush('#003466');
    link.setStroke('#003466');
    link.setLocked(true);
    diagram.addItem(link);
    
    var ep = link.getEndPoint();
    link.setEndPoint(link.getStartPoint());
    var animation = new Animation(link, { fromValue: link.getStartPoint(), toValue: ep, animationType: AnimationType.Bounce, easingType: EasingType.EaseOut, duration: 1000 }, onUpdateLink);
    
    animation.addEventListener(AnimationEvents.animationComplete, function (sender, args) {
        
        node.setVisible(true);

    });
    
    animation.start();
}

// This function is the driver function for deleting the box
// It is called when users select an answre in the previous boxes (any box higher than the current box)
// It will call the deleteRecursively function to delete the box
// Input: id is the id of the node that you want to delete
// No output
function deleteNode(id) {

    for(let i = 0; i < arr[id].length; i++) {
        let index = currTreeIdList.indexOf(arr[id][i]);
        if (index > -1) { // only splice array when item is found
          currTreeIdList.splice(index, 1); // 2nd parameter means remove one item only
        }
    }

    var nodes = diagram.nodes.filter(function (p) {
        return p.id === id;        
    });

    if (nodes.length > 0) {
        deleteRecursively(nodes[0].getOutgoingLinks());
    }
}


// This function can delete the single or multiples boxes 
// It is called when users select an answre in the previous boxes (any box higher than the current box)
// all redundant boxes below the box selected by the users will be deleted
// Input: links is a list of OutgoingLinks
// No output
function deleteRecursively(links) {
    for (var i = links.length - 1; i >= 0; i--) {
        var node = links[i].getDestination();
        var nlinks = node.getOutgoingLinks();
        deleteRecursively(nlinks);
        diagram.removeItem(node);


    }
}

// a custom update callback for link animations
// It is called by createAnimatedLink function
function onUpdateLink(animation, animationProgress) {
    var link = animation.item;
    var pointA = animation.getFromValue(),
        pointB = animation.getToValue();

    link.setEndPoint(
        new Point(
            pointA.x + (pointB.x - pointA.x) * animationProgress,
            pointA.y + (pointB.y - pointA.y) * animationProgress));
    link.invalidate();
}

// This function print and save the path from root to the current box
// It is called by the nextOption function, so it is called whenever users click the drop-down menu
// a path from root to the current node printed in the console and the path saving in a txt file
// Input: parent_id is the id of the current box, child_id is the id of the next box, ifsure is a boolean that is true when "not sure" is 
// not clicked and is false when "not sure" is clicked. 
function printPath(parent_id, child_id, ifsure) {
    let save_path = []
    console.log("Path(from root to curr): " + str_hyphens[parent_id] + "\n");
    save_path.push(str_hyphens[parent_id]);

    if(ifsure == true) {
        // we only print the child when the child is the leaf
        if(arr[child_id] != undefined && arr[child_id].length == 0) {
            console.log("Path(from root to curr): " + str_hyphens[child_id] + "\n");
            save_path.push(str_hyphens[child_id]);
        }
    }
    else if(ifsure == false) {
        if(arr[parent_id].length != 0) {
            for(let i = 0; i < arr[parent_id].length; i++) {
                console.log("Path(from root to curr): " + str_hyphens[arr[parent_id][i]] + "\n");
                save_path.push(str_hyphens[child_id]);
            }
        }
    }

    // for passing values to python
    let save_path_dic = Object.assign({}, save_path);
    const s_test = JSON.stringify(save_path_dic);
    $.ajax({
        url:"/root_to_curr",
        type:"POST",
        contentType:"application/json",
        data: JSON.stringify(s_test)
    });


}

// findPath gives the path from root to the target node. 
// Input: root_id is the id of the root which is zero in our case. path is a list to store the path. k is the id of the box with keyword.
// Output: a boolean variable which is true when the box with keyword is found in the tree and false when the box with keyword is not found in the tree. 
function findPath(root_id, path, k) {
    // base case
    if(root_id == undefined) {
        return false;
    }
    
    path.push(root_id);

    if(root_id == k) {
        return true;
    }

    for(let j = 0; j < arr[root_id].length; j++) {
        if(arr[root_id].length != 0 && findPath(arr[root_id][j], path, k)) {
            return true;
        }
    }

    //pop out because the key is not in the subtree of the node
    path.pop();
    return false;

}

// subtree is a function that prints the subtree of a box
// Input: ifSubtree is a variable indicating whether users want to print the subtree. node_id is the id of the box that having the subtree
// When ifSubtree == no, the users want to print the path from root to the box with keyword
// When ifSubtree == yes, the users want to print the subtree
// When ifSubtree == other, the users want to print boxes other than boxes in the path or subtree
// no output
function subtree(ifPrint, node_id) {

    if(node_id < arr.length && arr[node_id].length == 0) {
        return;
    }
    else if(node_id < arr.length) {
        for(let j = 0; j < arr[node_id].length; j++) {
            if(ifPrint == true) {
                // print out the subtree
                console.log(str_hyphens[arr[node_id][j]]);
            }

            path_subtree.push(str_hyphens[arr[node_id][j]]);
            pathAndSubtree.push(arr[node_id][j]);
            subtree(ifPrint, arr[node_id][j]);
        }
    }
}


// input_search is a function that shows the results of searching. 
// It is called when users clicked the 'search' button
// It allows users to choose from multiple results when more than one box containing the keyword.
// It also allows users to decide how to print out the results as hyphens format: path, subtree, or other boxes
// no input 
function input_search() {
    keyword = $('#input').val();
    result = keywordSearch(keyword);

    if(result.length == 0) {
        alert("The box containing this keyword doesn't exist.");
    }
    else if(keyword == '') {
        alert("You did not input any keyword");
    }
    else if(result.length == 1) {
        let text = document.getElementById('result');
        
        text.innerHTML = 'Only one box containing the keyword: <br>';
        text.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';
        
        // for checking the first option
        text.innerHTML += str[result[0]] + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br>';
        
        // let btn = document.getElementById("select_button_wrapper");
        // btn.innerHTML = '<button id="select" onclick="submit()">select</button><br><br>';
    }
    else {
        let text = document.getElementById('result');
        text.innerHTML = '<br>Please click "Expand" button to see the result from each group<br><br>' ;
        text.innerHTML += "<button onclick=" + "showOrHideResultsX(result)" + ">Expand</button>";
        text.innerHTML += '<div id="alreadyVisited">Boxes in tree so far: </div><br>';


        // for(let i = 0; i < result.length; i++) {
        //     if(currTreeIdList.includes(result[i])) {
        //         console.log(currTreeIdList[i]);
        //         text.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'" checked> <br> ';
        //     }
        // }

        text.innerHTML += "<button onclick=" + "showOrHideResultsY(result)" + ">Expand</button>";
        text.innerHTML += '<div id="reachable">Boxes reachable from current tree: </div><br>';
        
        // subtree('yes', currTreeIdList[currTreeIdList.length - 1]);        
        // for(let i = 0; i < result.length; i++) {
        //     if(pathAndSubtree.includes(result[i])) {
        //         text.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'" checked> <br> ';
        //     }
        // }
        
        pathAndSubtree = []; // empty the pathAndSubtree

        text.innerHTML += "<button onclick=" + "showOrHideResultsZ(result)" + ">Expand</button>";
        text.innerHTML += '<div id="otherNodes">Other boxes: </div><br>';

        // for(let i = 0; i < result.length; i++) {
        //     if(currTreeIdList.includes(result[i]) == false && pathAndSubtree.includes(result[i]) == false) {
        //         text.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'" checked> <br> ';
        //     }
        // }



        // // for checking the first option
        // text.innerHTML += str[result[0]] + '<input name="search_result" type="radio" value="'+ result[0] +'" checked> <br> ';
        // for(let i = 1; i < result.length; i++) {
        //     text.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br>';
        // }

    }
}

// keywordSearch is a function that searches the box with keyword 
// Input: keyword
// Output: a list containing the id of the nodes with keywords. 
function keywordSearch(key) {
    let loc = [];
    for(let i = 0; i < str_hyphens.length; i++) {
        let str_answer = str_hyphens[i].substring(str_hyphens[i].search(',') + 2, str_hyphens[i].length);
        result = str_answer.search(key);
        if(result != -1) {
            loc.push(i);
        }
    }

    return loc;
}

// submit is a function to be called when the user clicks the submit button after selecting all the radio buttons in the search box
// it will reload the page and set ifSearch variable to 'yes'. 
// once the ifSearch becomes 'yes', the page can show the desired box after reloading
// no input or output
function submit(){
    if(atLeastOneRadio() == true) {
        let result = document.getElementsByName('search_result');
        for(let i = 0; i < result.length; i++) {
            if(result[i].checked) {
                localStorage.setItem("search_result", JSON.stringify(result[i].value));
            }
        }
    
        let ifSubtree = document.getElementsByName('ifSubtree');
        for(let i = 0; i < ifSubtree.length; i++) {
            if(ifSubtree[i].checked) {
                localStorage.setItem("ifSubtree", JSON.stringify(ifSubtree[i].value));
    
            }
        }
        localStorage.setItem("ifSearch", JSON.stringify('yes'));
        window.location.href = "tree.html"; 
    }
    else {
        alert("Please choose one radio button");
    }
}

// newInput handles the situation where the user selects a node containing the "DECISIONTREE" keyword.
// It wills combine the tree with a new tree.  
// Input: link is a link containing the new tree. id is the id of the current node. ifCheckbox is a boolean indicating whether the 
// current node has checkbox. addIdForCheckbox is number that we need to add to the id when the current node has checkbox
// no output
// side effect: it needs to reload the page to update the data stored in the previous node. 
// It uses search function to return to the current node so that the siblings of the current node will disappear. 
function newInput(link, id, ifCheckbox, addIdForCheckbox) {
    // add new input into str, str-hyphens, obj, vec, and arr. 
    // The code inside the "get" seems run in a wierd order. The str and str_hyphens will belong to new input as long as you are in the "get". 
    // That is why I store str anfd str_hyphens in new variable first.    
    // let str_old = str;
    let str_hyphens_old = str_hyphens;
    // sender.id is not an interger, you must parse it to int. 
    id = parseInt(id);
    $.get( link, function( data) {

        let str_old = [];
        let arr_get = [];
        var str2 = [];
        var n;
        var obj;
        let stack = [];
        // var arr = [];
        var zero = [];
        var vec;
        var text = data;
        if(ifCheckbox == true) {
            id = id + addIdForCheckbox + 1; // plus one because addIdForCheckbox started from zero
        }
        
        let str_hyphens2 = text.split("\n"); 
        str_hyphens2 = str_hyphens2.filter(n => n);

        str_hyphens2[0] = "if show next, " + str_hyphens2[0]; 
        // Add more hyphens to the new input: str_hyphens2
        let more_hyphens = '--';
        for (let j = 0; j < str_hyphens_old[id].length; j++) {
            if (str_hyphens_old[id][j] != '-') break;
            else more_hyphens += '-';
        }

        for(let i = 0; i < str_hyphens2.length; i++) {
            str_hyphens2[i] = more_hyphens.concat(str_hyphens2[i]);
        }

        str_hyphens_old = str_hyphens_old.filter(n => n);

        let left = [];
        let right = [];
        for(let i = 0; i < id + 1; i++) {
            left.push(str_hyphens_old[i]);
        }

        for(let i = id + 1; i < str_hyphens_old.length; i++) {
            right.push(str_hyphens_old[i]);
        }
        
        str_hyphens = left.concat(str_hyphens2);
        str_hyphens = str_hyphens.concat(right);    
        
        
        n = str_hyphens.length;

        vec = new Array(n);
        obj = new Array(n);
        for (var i = 0; i < obj.length; i++) {
            obj[i] = new Array(4);
            arr_get[i] = new Array(0);
        }
    
        let error = "";
        for (var i = 0; i < n; i++) {
            let size = 0;
    
            // count the number of hyphens of this line
            for (var j = 0; j < str_hyphens[i].length; j++) {
                if (str_hyphens[i][j] != '-') break;
                else size++;
            }
    
            // count the number of hyphens of the next line
            let next_size = 0;
            if (i != n - 1) {
                for (var j = 0; j < str_hyphens[i + 1].length; j++) {
                    if (str_hyphens[i + 1][j] != '-') break;
                    else next_size++;
                }
            }
    
            vec[size / 2] = i;
            if (size == 0) {
                zero.push(i);
            }
            else {
                arr_get[vec[(size / 2) - 1]].push(i);
            }
    
            // get rid of the hyphens in str array
            str_old[i] = str_hyphens[i].substring(size);
    
            //ZL: I don't know what the obj is used for as it is never used again thereafter. However, the system will crash if I commented this line 
            obj[size / 2].push(str_old[i]);
        }
        
        localStorage.setItem("str-array", JSON.stringify(str_old));
        localStorage.setItem("str-hyphens-array", JSON.stringify(str_hyphens));
        localStorage.setItem("arr-array", JSON.stringify(arr_get));
        localStorage.setItem("ifSearch", JSON.stringify('yes'));
        localStorage.setItem("ifNewInput", JSON.stringify('no'));
        localStorage.setItem("search_result", JSON.stringify(id));
        window.location.href = "tree.html";
        
    });
    
}

// This function saves the answers of checkbox and calls showCheckbox function to show the corresponding children nodes. 
// no input or output
function checkboxAnswers() {
    deleteNode(currOriginNode.id);
    // save the answers of checkbox
    results = [];
    let checkbox = document.getElementsByClassName('checkbox');
    for(let i = 0; i < checkbox.length; i++) {
        if(checkbox[i].checked == true) {
            results.push(i);
        }
    }
    showCheckbox(currId, currOriginNode, results);

}


dragElement(document.getElementById("mydiv"));

// This function makes the search box draggable
// It will be called when users click the search box
// Input: the html element of the search box
// no output
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  // This function gets the mouse cursor position and calls elementDrag function
  // Input: everything
  // no output
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  // This function calculate the new cursor position and set the html element new position
  // Input: everything
  // no output
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  // This function stops moving the element when mouse button is release
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// This function can show or hide the results from each group. 
// It will be called when users clicked the first show/hide button.
// It will also record the text in the current box for copy and paste.
// Input: search result 
// no output
function showOrHideResultsX(result) {
    let x = document.getElementById("alreadyVisited");
    if(x.textContent === "Boxes in tree so far: ") {
        x.innerHTML += '<br>';

        x.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';
       

        let hasResult = false;
        for(let i = 0; i < result.length; i++) {
            if(currTreeIdList.includes(result[i])) {
                console.log(currTreeIdList[i]);
                x.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br> ';
                hasResult = true;
            }
        }

        if ($('input[name=search_result]:checked').length > 0) {
            console.log("reach");
            ifClickedRadio = true; 
        }   

        if(hasResult == false) {
            x.innerHTML += "No Result";
        }
    }
    else {
        x.innerHTML = "Boxes in tree so far: ";
    }

    // let btn = document.getElementById("select_button_wrapper");
    // btn.innerHTML = '<button id="select" onclick="submit()">select</button><br><br>';
}

// This function can show or hide the results from each group. 
// It will be called when users clicked the second show/hide button.
// Input: search result 
// no output
function showOrHideResultsY(result) {
    let y = document.getElementById("reachable");
    if(y.textContent === "Boxes reachable from current tree: ") {
        y.innerHTML += '<br>';

        y.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font> <br><br>';

        let hasResult = false;
        subtree(false, currTreeIdList[currTreeIdList.length - 1]);        
        for(let i = 0; i < result.length; i++) {
            if(pathAndSubtree.includes(result[i])) {
                y.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br> ';
                hasResult = true;
            }
        }

        if ($('input[name=search_result]:checked').length > 0) {
            console.log("reach");
            ifClickedRadio = true; 
        }   

        if(hasResult == false) {
            y.innerHTML += "No Result";
        }
    }
    else {
        y.innerHTML = "Boxes reachable from current tree: ";
    }

    // let btn = document.getElementById("select_button_wrapper");
    // btn.innerHTML = '<button id="select" onclick="submit()">select</button><br><br>';
}

// This function can show or hide the results from each group. 
// It will be called when users clicked the third show/hide button.
// Input: search result 
// no output
function showOrHideResultsZ(result) {
    let z = document.getElementById("otherNodes");
    if(z.textContent === "Other boxes: ") {
        z.innerHTML += '<br>';

        z.innerHTML += '<font size="-1"> (Choose at most one radio button. If you want to see the corresponding box, click one of the radio buttons below.) </font><br><br>';

        let hasResult = false;
        for(let i = 0; i < result.length; i++) {
            if(currTreeIdList.includes(result[i]) == false && pathAndSubtree.includes(result[i]) == false) {
                z.innerHTML += str[result[i]] + '<input name="search_result" type="radio" value="'+ result[i] +'"> <br>';
                hasResult = true;
            }
        }
        
        if ($('input[name=search_result]:checked').length > 0) {
            console.log("reach");
            ifClickedRadio = true; 
        }   

        if(hasResult == false) {
            z.innerHTML += "No Result";
        }
    }
    else {
        z.innerHTML = "Other boxes: ";
    }

    // let btn = document.getElementById("select_button_wrapper");
    // btn.innerHTML = '<button id="select" onclick="submit()">select</button><br><br>';
}

// This function can check if the radio button is selected
// It will be called for 10000 milliseconds 
// no input or output
function checkRadioButton() {
    if(atLeastOneRadio() == true) {
        let result = document.getElementsByName('search_result');
        for(let i = 0; i < result.length; i++) {
            if(result[i].checked) {
                localStorage.setItem("search_result", JSON.stringify(result[i].value));
            }
        }
    
        let ifSubtree = document.getElementsByName('ifSubtree');
        for(let i = 0; i < ifSubtree.length; i++) {
            if(ifSubtree[i].checked) {
                localStorage.setItem("ifSubtree", JSON.stringify(ifSubtree[i].value));
    
            }
        }
        localStorage.setItem("ifSearch", JSON.stringify('yes'));
        window.location.href = "tree.html"; 
    }
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }
  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  
  var copyBobBtn = document.querySelector('.js-copy-bob-btn'),
    copyJaneBtn = document.querySelector('.js-copy-jane-btn');
  
  copyBobBtn.addEventListener('click', function(event) {
    copyTextToClipboard('Bob');
  });
  
  
  copyJaneBtn.addEventListener('click', function(event) {
    copyTextToClipboard('Jane');
  });

function atLeastOneRadio() {
    return ($('input[type=radio]:checked').length > 0);
}
