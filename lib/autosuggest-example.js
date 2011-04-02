var ASExample = (function () {
    $(function () {
        ASExample.init();
    });
    
    function _init() {
        var options = {
            selectedItemProp : "name", 
            searchObjProps : "name",
            retrieveLimit : '10'
        };
        
        var data = [
            { value : "1", name : "HTML" },
            { value : "2", name : "CSS" },
            { value : "3", name : "JavaScript" },
            { value : "4", name : "jQuery" },
            { value : "5", name : "DOM Scripting" },
            { value : "6", name : "Progressive enhancement" },
            { value : "7", name : "CSS box-shadow" },
            { value : "8", name : "Canvas" },
            { value : "9", name : "CSS gradients" },
            { value : "10", name : "Geolocation" },
            { value : "11", name : "localStorage" },
            { value : "12", name : "Microdata" },
            { value : "13", name : "Web standards" },
            { value : "14", name : "Optimisation" },
            { value : "15", name : "Python" }
        ];
    
        $('#addtags').autoSuggest(data, options);
    };
    
    return {
        init : _init
    };
}());