/*
  42team contributors: main@42team.org
  name: Galery
  description: Gallery for admin integration
  by: Ilya Dolmatov
  dolmatoffilya@gmail.com
*/

class Image{
    constructor(id, url, title, description, credits, year) {
        this.id = id;
        this.url = url;
        this.title = title;
        this.description = description;
        this.credits = credits;
        this.year = year;
    }

    toJSON() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            description: this.description,
            credits: this.credits,
            year: this.year
        }
    }
}

class File {
    constructor(id, url) {
        this.id = id;
        this.url = url;
        this.type = url.substring(url.lastIndexOf(".") + 1, url.length);
    }

    toJSON() {
        return {
            id: this.id,
            url: this.url,
            type: this.type
        }
    }
}

class FileManager {
    constructor(params) {
        this.uploadAction = params.upload;
        this.manager = '#' + params.displayId;
        this.dropzoneId = 'dz-' + params.displayId;
        for (let i = 0; i < params.acceptedFiles.length; i++)
            params.acceptedFiles[i] = '.' + params.acceptedFiles[i];
        this.acceptedFiles = params.acceptedFiles.join(', ');

        this.viewType = params.viewType;
        const viewType = this.viewType;
        if (viewType === 'images') {
            this.dataInput = params.images.dataListener;
            this.preview = params.images.previewListener;
            this.dataJSON = (params.images.data) ? params.images.data : '[]';
            this.modalId = 'file-modal-' + params.displayId;
        }
        if (viewType === 'image') {
            this.dataInput = params.image.previewListener;
            this.dataJSON = params.image.data;
        }
        if (viewType === 'files') {
            this.dataJSON = params.files.data;
            this.dataInput = params.files.dataListener;
        }

        this.prevIndex = 0;
        this.ids = [];
        this.files = [];

        this.init(viewType);
    }

    init(type) {
        const elem = '<div id="file-manager"></div>';
        const temp = document.createElement('div');
        temp.innerHTML = elem;
        $(this.manager)[0].appendChild(temp.firstChild);

        $('[data-toggle="tooltip"]').tooltip();
        let imageColumns = Math.round($("#file-manager").width() / 145);
        if (type === 'image')
            imageColumns = 2;
        $("#file-manager").attr('data-image-columns', imageColumns);

        if (type === 'images')
            this.addModalDialog();
        this.addForm();
        this.dropzoneInit(type);
        this.loadFiles(type);
        if (type[type.length - 1] === 's')
            this.makeSortable();
    }

    addModalDialog() {
        let elem = "<div class=\"modal fade\" id=\"" + this.modalId + "\" tabindex=\"-1\" role=\"dialog\">\n" +
            "    <div class=\"modal-dialog modal-lg\" role=\"document\">\n" +
            "        <div class=\"modal-content\">\n" +
            "            <div class=\"modal-header\">\n" +
            "                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n" +
            "                <h4 class=\"modal-title\">Details for image</h4>\n" +
            "            </div>\n" +
            "            <div class=\"modal-body\">\n" +
            "                <div id=\"image-preview-modal\"></div>\n" +
            "                <div class=\"row image-data-row\">\n" +
            "                    <div class=\"col-sm-4 static-data\">\n" +
            "                        <ul class=\"file-info-list\">\n" +
            "                            <li><strong>File name:</strong> <span id=\"filename\"></span></li>\n" +
            "                            <li><strong>File type:</strong> <span id=\"file-extension\"></span></li>\n" +
            "                            <li><strong>File size:</strong> <span id=\"filesize\"></span></li>\n" +
            "                            <li><strong>Dimensions:</strong> <span id=\"file-dimensions\"></span></li>\n" +
            "                        </ul>\n" +
            "                    </div>\n" +
            "                    <div class=\"col-sm-8 dynamic-data\">\n" +
            "                        <form class=\"form-horizontal\">\n" +
            "                            <div class=\"form-group\">\n" +
            "                                <label for=\"url\" class=\"col-sm-2 control-label\">URL</label>\n" +
            "                                <div class=\"col-sm-10\">\n" +
            "                                    <input type=\"text\" class=\"form-control\" id=\"url\" disabled>\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"form-group\">\n" +
            "                                <label for=\"title\" class=\"col-sm-2 control-label\">Title</label>\n" +
            "                                <div class=\"col-sm-10\">\n" +
            "                                    <input type=\"text\" class=\"form-control\" id=\"title\" placeholder=\"Title\">\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"form-group\">\n" +
            "                                <label for=\"desc\" class=\"col-sm-2 control-label\">Description</label>\n" +
            "                                <div class=\"col-sm-10\">\n" +
            "                                    <input type=\"text\" class=\"form-control\" id=\"desc\">\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"form-group\">\n" +
            "                                <label for=\"year\" class=\"col-sm-2 control-label\">Year</label>\n" +
            "                                <div class=\"col-sm-10\">\n" +
            "                                    <input type=\"text\" class=\"form-control\" id=\"year\">\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                            <div class=\"form-group\">\n" +
            "                                <label for=\"credits\" class=\"col-sm-2 control-label\">Credits</label>\n" +
            "                                <div class=\"col-sm-10\">\n" +
            "                                    <input type=\"text\" class=\"form-control\" id=\"credits\">\n" +
            "                                </div>\n" +
            "                            </div>\n" +
            "                        </form>\n" +
            "                        <div class=\"text-right\">\n" +
            "                            <a href=\"\" target=\"blank\" id=\"full-image-link\">Preview on new tab</a>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "            <div class=\"modal-footer\">\n" +
            "                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n" +
            "                <button type=\"button\" class=\"btn btn-primary save-changes\" data-dismiss=\"modal\">Save Changes</button>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>";

        const temp = document.createElement('div');
        temp.innerHTML = elem;
        document.body.appendChild(temp.firstElementChild);
    }

    addForm() {
        let elem = '<div class="box" id="' + this.dropzoneId + '" method="post" action="' + this.uploadAction + '">' +
            '<strong>Choose a file</strong> or drag it here.' +
            '</div>';

        const temp = document.createElement('div');
        temp.innerHTML = elem;
        $(this.manager)[0].appendChild(temp.firstChild);
    }

    dropzoneInit(type) {
        const this_ = this;
        let multi = false;
        if (type === 'images' || type === 'files')
            multi = true;
        const mdz = new Dropzone('#' + this.dropzoneId, {
            acceptedFiles: this_.acceptedFiles,
            maxFiles: multi ? 10 : 1
        });
        mdz.on('success', function (file, res) {
            console.log(res);

            $('.dz-success-mark').remove();
            $('.dz-error-mark').remove();
            $('.label-start').remove();
            $('.dz-preview').remove();

            if (res.success_) {
                if (type === 'images') {
                    this_.addElementImage(res.toAdd, false, type);
                    this_.files.push(res.toAdd);
                }
                if (type === 'image') {
                    this_.replaceElement(res.toAdd, false, type);
                    this_.files = res.toAdd.url;
                }
                if (type === 'files') {
                    this_.addElementFile(res.toAdd, type);
                    this_.files.push(res.toAdd);
                }
                this_.sendData(this_.dataInput, this_.files);
            }
        });
        mdz.on('error', function () {
            $('.dz-success-mark').remove();
            $('.dz-error-mark').click(function () {
                $('.label-start').remove();
                $('.dz-preview').remove();
            });
        });
    }

    loadFiles(type) {
        //$('#' + this.dataInput)[0].value = this.dataJSON;
        this.dataJSON = $('#' + this.dataInput)[0].value;
        if (type === 'images') {
            this.files = JSON.parse(this.dataJSON);
            const prim = $('#' + this.preview)[0].value;

            for (let i in this.files) {
                let t = false;
                if (this.files[i].url === prim)
                    t = true;
                this.addElementImage(this.files[i], t, type);
            }
        }
        if (type === 'image') {
            this.files = new Image(0, this.dataJSON, '', '', '', '');
            this.addElementImage(this.files, false, type);
        }
        
        if (type === 'files') {
            console.log(JSON.parse(this.dataJSON));
            this.files = JSON.parse(this.dataJSON);
            for (let i in this.files) {
                this.addElementFile(this.files[i], type);
            }
        }

        $('.image-container').each(function () {
            if ($(this).find('img').width() > $(this).find('img').height()) {
                $(this).addClass('landscape');
            } else if ($(this).find('img').width() < $(this).find('img').height()) {
                $(this).addClass('portrait');
            } else {
                $(this).addClass('square');
            }
        });

        for (let i = 0; i < this.files.length; i++)
            this.ids.push(this.files[i].id);

        this.setListener(type);
    }

    makeSortable() {
        const this_ = this;
        $("#file-manager").sortable({
            handle: '.fa-arrows',
            helper: 'clone',
            items: '> .file-container',
            placeholder: 'file-container image-placeholder',
            tolerance: 'pointer',
            start: function(event, ui) {
                ui.placeholder.height(ui.item.height());
                ui.placeholder.html('<div class="inner-placeholder"></div>');
                this.prevIndex = ui.item.index();
            },
            stop: function (event, ui) {
                const index = ui.item.index();
                let ids = this_.ids;
                console.log(this_.ids);
                const prevIndex = this.prevIndex;
                console.log(ids);

                if (index !== prevIndex) {
                    const temp = ids[prevIndex];
                    if (prevIndex > index) {
                        for (let i = prevIndex - 1; i >= index; i--)
                            ids[i + 1] = ids[i];
                        ids[index] = temp;
                    } else {
                        for (let i = prevIndex; i < index; i++)
                            ids[i] = ids[i + 1];
                        ids[index] = temp;
                    }
                    console.log(ids);

                    let newImgs = new Array(this_.files.length);
                    for(let i = 0; i < ids.length; i++)
                        for(let j = 0; j < this_.files.length; j++)
                            if (this_.files[j].id === ids[i])
                                newImgs[i] = this_.files[j];

                    this_.sendData(this_.dataInput, newImgs);
                }
            }
        });
    }

    setListener(type) {
        const this_ = this;
        $('.on-file-controls > .fa-times').click(function() {
            $(this).parents('.file-container').remove();
            let url;
            console.log($(this).parents('.file-container')[0].children[0].children[1].children[0].getAttribute("url"));
            if (type === 'images' || type === 'image')
                url = $(this).parents('.file-container')[0].children[0].children[1].children[0].src;
            else
                url = $(this).parents('.file-container')[0].children[0].children[1].children[0].getAttribute("url");
            for(let i = 0; i < this_.files.length; i++) {
                const j = this_.files[i];
                if (j.url === url) {
                    this_.files.splice(j, 1);
                }
            }
            this_.sendData(this_.dataInput, this_.files);
        });

        $('.on-file-controls > .fa-check').click(function() {
            $('.file-container').removeClass('picked-as-primary');
            $(this).parents('.file-container').addClass('picked-as-primary');
            const url = $(this).parents('.file-container')[0].children[0].children[1].children[0].src;
            console.log(url.substr(url.indexOf('/', 8), url.length));
            this_.sendData(this_.preview, url.substr(url.indexOf('/', 8), url.length));
        });

        $('.on-file-controls > .fa-info-circle').click(function() {
            const image = $(this).parents('.file-container').find('img');
            const path = image.attr('src');
            let filename = path.replace(/\\/g, '/');
            filename = filename.substring(filename.lastIndexOf('/')+ 1).replace(/[?#].+$/, '');
            const dimensions = image.get(0).naturalWidth + ' x ' + image.get(0).naturalHeight;
            const desc = image.attr('desc');
            const title = image.attr('title');
            const year = image.attr('year');
            const credits = image.attr('credits');
            const id = image.attr('id');

            const xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = function() {
                if(this.readyState === this.DONE) {
                    let filesize;
                    if(this.response.byteLength >= 1000000) {
                        filesize = this.response.byteLength/1000000;
                        filesize = Math.round(filesize * 10)/10 + ' MB';
                    } else {
                        filesize = Math.round(this.response.byteLength/1000) + ' KB';
                    }
                    $('.static-data #filesize').text(filesize);
                }
            };
            xhr.send(null);

            $('#image-preview-modal').html('<img src="'+ path +'">');
            $('.static-data #filename').text(filename);
            $('.static-data #file-dimensions').text(dimensions);

            $('.dynamic-data #url').val(path);
            $('.dynamic-data #title').val(title);
            $('.dynamic-data #desc').val(desc);
            $('.dynamic-data #full-image-link').attr('href', path);
            $('.dynamic-data #year').val(year);
            $('.dynamic-data #credits').val(credits);

            let clicked = false;
            $('.save-changes').click(function () {
                if (!clicked) {
                    clicked = true;
                    const title = $('.dynamic-data #title').val();
                    const desc = $('.dynamic-data #desc').val();
                    const year = $('.dynamic-data #year').val();
                    const credits = $('.dynamic-data #credits').val();

                    image.attr('desc', desc);
                    image.attr('title', title);
                    image.attr('year', year);
                    image.attr('credits', credits);

                    for(let i = 0; i < this_.files.length; i++) {
                        const j = this_.files[i];
                        if (j.id.toString() === id) {
                            j.title = title;
                            j.desc = desc;
                            j.year = year;
                            j.credits = credits;
                        }
                    }

                    this_.sendData(this_.dataInput, this_.files);
                }
            });
            console.log('5');

            $('#' + this_.modalId).modal('show');
            console.log('6');
        });
    }

    addElementImage(img, prim, type) {
        let elem = "<div class=\"file-container" + (prim ? ' picked-as-primary' : '') + "\">\n" +
            "<div class=\"inner-file-container\">\n";

        elem += (type === 'images') ? "  <div class=\"on-file-controls\">\n" +
            "      <span class=\"fa fa-arrows\"></span>\n" +
            "      <span class=\"fa fa-check\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Pick as primary\"></span>\n" +
            "      <span class=\"fa fa-info-circle\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Image info\"></span>\n" +
            "      <span class=\"fa fa-times\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete image\"></span>\n" +
            "    </div>\n": '';

        elem += "    <div class=\"center-container\">\n" +
            "      <img src=" + img.url + " title='" + img.title + "' desc='" + img.description +
            "' year='" + img.year + "' credits='" + img.credits + "'\n" + "id='" + img.id + "'>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</div>";

        const temp = document.createElement('div');
        temp.innerHTML = elem;
        $("#file-manager")[0].appendChild(temp.firstChild);

        this.setListener(type);
    }
    
    addElementFile(file, type) {
        let elem = "<div class=\"file-container\">\n" +
            "<div class=\"inner-file-container\">\n";

        elem += (type === 'files') ? "  <div class=\"on-file-controls\">\n" +
            "      <span class=\"fa fa-arrows\"></span>\n" +
            "      <span class=\"fa fa-times\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete file\"></span>\n" +
            "    </div>\n": '';

        elem += "    <div class=\"center-container\">\n" +
            "      <div class='fileupload-icon fileupload-" + file.type + "' url='" + file.url + "'></div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</div>";

        const temp = document.createElement('div');
        temp.innerHTML = elem;
        $("#file-manager")[0].appendChild(temp.firstChild);

        this.setListener(type);
    }

    replaceElement(img) {
        let elem = "<div class=\"image-container\">\n" +
            "<div class=\"inner-image-container\">\n" +
            "    <div class=\"center-container\">\n" +
            "      <img src=" + img.url + ">\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</div>";

        const temp = document.createElement('div');
        temp.innerHTML = elem;
        console.log($("#file-manager")[0].children);
        $("#file-manager")[0].children[0].replaceWith(temp.firstChild);

        $('.image-container').each(function () {
            if ($(this).find('img').width() > $(this).find('img').height()) {
                $(this).addClass('landscape');
            } else if ($(this).find('img').width() < $(this).find('img').height()) {
                $(this).addClass('portrait');
            } else {
                $(this).addClass('square');
            }
        });
    }

    sendData(inputId, data) {
        const node = $('#' + inputId)[0];
        console.log(node);
        node.value = JSON.stringify(data);
    }
}
