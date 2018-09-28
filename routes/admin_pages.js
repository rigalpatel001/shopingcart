const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Page } = require('../models/page'); 
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/*
*  List All Pages 
*/
router.get('/' ,async (req,res) => {
   
    const pages = await Page.find().sort('sorting 1');
    res.render('admin/pages',{
        pages : pages,
        title: "list of pages"
    });

});

/*
*  Add Page Load form
*/
router.get('/add-page' , (req,res) => {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content,
        update: false
    });
 });

 /*
 * Sorting Function
 */
 
function sortingPages(ids,callback){
   
    var count = 0;
    for(var i = 0 ; i< ids.length;i++){
        var id = ids[i];
        count++;
       (async function(count){

            const page =  await Page.findByIdAndUpdate(id,
                { 
                   sorting: count
                }, { new: true });
                
                ++count;
                if (count >= ids.length) {
                    callback();
                }

       })(count);
    }

}


/*
*  Reorder page
*/
router.post('/reorder-pages' ,(req,res) =>{

    const ids = req.body['id[]'];
    sortingPages(ids, function () {
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});

/*
*  Get Edit Page 
*/
router.get('/edit-page/:slug' ,async (req,res) => {
    
  const page = await Page.findOne({slug: req.params.slug});
    res.render('admin/add_page', {
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id,
        update: true
    });
 });


/*
*  Add Page 
*/
 router.post('/add-page',async (req,res) => {

    req.checkBody('title','title must have value').notEmpty();
    req.checkBody('content','Content must have value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

     var errors = req.validationErrors();
     if(errors){
      res.render('admin/add_page', {
            errors:errors,
            title: title,
            slug: slug,
            content: content,
            update: false
        });
     }else{
       const pageexist =   await Page.findOne({slug:slug});
       if(pageexist){
        req.flash('danger','Slug already exixt Choose another one.');
        res.render('admin/add_page', {
            title: title,
            slug: slug,
            content: content,
            update: false
        });
       }else{
        var page = new Page(
            {
                title: title,
                slug : slug,
                content: content,
                sorting: 100
    
        });
        page =  await page.save();

        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        req.flash('success','Page added...');
        res.redirect('/admin/pages');
       } 

       
    }
 });

 /*
 *  Update page
 */

router.post('/edit-page/:slug', async (req,res) => {

    req.checkBody('title','title must have value').notEmpty();
    req.checkBody('content','Content must have value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.body.id;

     var errors = req.validationErrors();
     if(errors){
      res.render('admin/add_page', {
            errors:errors,
            title: title,
            slug: slug,
            content: content,
            update: ture,
            id: id
        });
     }else{
       const pageexist =   await Page.findOne({slug:slug, _id: {'$ne': id}});
       if(pageexist){
        req.flash('danger','Slug already exixt Choose another one.');
        res.render('admin/add_page', {
            title: title,
            slug: slug,
            content: content,
            update: true,
            id: id
        });
       }else{
        await Page.findByIdAndUpdate(id,{
            $set:{
                title: title,
                slug : slug,
                content: content
              }
            });

        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                if (err) {
                    console.log(err);
                } else {
                    req.app.locals.pages = pages;
                }
        });    
        req.flash('success','Page Updated...');
        res.redirect('/admin/pages/edit-page/'+slug);
       } 
    }
 });

 /*
*  Get Delete Page 
*/
router.get('/delete-page/:id' ,async (req,res) => {
    
    const page = await Page.findByIdAndRemove(req.params.id);
    
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        if (err) {
            console.log(err);
        } else {
            req.app.locals.pages = pages;
        }
    });
    req.flash('success','Page Deleted...');
    res.redirect('/admin/pages/');
   });

module.exports = router;