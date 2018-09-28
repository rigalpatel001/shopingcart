const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Category  = require('../models/category');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

/*
*  List All Categories 
*/

router.get('/' ,async (req,res) => {
    
    const categories = await Category.find();
    res.render('admin/categories',{
        categories : categories,
        title: "list of Categories"
    });

});

/*
*  Get Category form
*/
router.get('/add-category' , (req,res) => {

    var title = "";
    var slug = "";

    res.render('admin/add_category', {
        title: title,
        slug: slug,
        update: false
    });
 });


/*
*  Get Edit Category 
*/
router.get('/edit-category/:slug' ,async (req,res) => {
    
  const category = await Category.findOne({slug: req.params.slug});
    res.render('admin/add_category', {
        title: category.title,
        slug: category.slug,
        id: category._id,
        update: true
    });
 });


/*
*  Add Category 
*/
 router.post('/add-category',async (req,res) => {

    req.checkBody('title','title must have value').notEmpty();
   
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();

     var errors = req.validationErrors();
     if(errors){
      res.render('admin/add_category', {
            errors:errors,
            title: title,
            slug: slug,
            update: false
        });
     }else{
       const categoryexist =   await Category.findOne({slug:slug});
       if(categoryexist){
        req.flash('danger','Slug already exixt Choose another one.');
        res.render('admin/add_category', {
            title: title,
            slug: slug,
            update: false
        });
       }else{
        var category = new Category(
            {
                title: title,
                slug : slug
        });
         await category.save();
         // Get all categories to pass to header.ejs
        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });
        req.flash('success','Category added...');
        res.redirect('/admin/categories');
       } 

       
    }
 });

 /*
 *  Update Category
 */

router.post('/edit-category/:id', async (req,res) => {

    req.checkBody('title','title must have value').notEmpty();
   
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
      var id = req.body.id;

     var errors = req.validationErrors();
     if(errors){
      res.render('admin/add_category', {
            errors:errors,
            title: title,
            slug: slug,
            update: ture,
            id: id
        });
     }else{
       const categoryexist =  await Category.findOne({slug:slug, _id: {'$ne': id}});
       if(categoryexist){
        req.flash('danger','Slug already exixt Choose another one.');
        res.render('admin/add_category', {
            title: title,
            slug: slug,
            update: true,
            id: id
        });
       }else{
        await Category.findByIdAndUpdate(id,{
            $set:{
                title: title,
                slug : slug
              }
            });
         // Get all categories to pass to header.ejs
        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });   
        req.flash('success','Category Updated...');
        res.redirect('/admin/categories/edit-category/'+slug);
       } 
    }
 });

 /*
*  Get Delete Category 
*/
router.get('/delete-category/:id' , async (req,res) => {
    
    const category = await Category.findByIdAndRemove(req.params.id);
   
    // Get all categories to pass to header.ejs
    Category.find(function (err, categories) {
        if (err) {
            console.log(err);
        } else {
            req.app.locals.categories = categories;
        }
    });
    req.flash('success','Category Deleted...');
    res.redirect('/admin/categories/');
   });

module.exports = router;