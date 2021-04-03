let controller;
let slideScene;
let pageScene;
let detailScene;

function animateSlides() {
  //Initialise Controller
  controller = new ScrollMagic.Controller();
  //GSAP - animation library
  //Select elements
  const sliders = document.querySelectorAll(".slide");
  const nav = document.querySelector(".nav-header");
  //Loop over each slide
  sliders.forEach((slide, index, slides) => {
    const revealImg = slide.querySelector(".reveal-img");
    const img = slide.querySelector(".hero-img img");
    const revealText = slide.querySelector(".reveal-text");

    //GSAP
    //to.(element, time(sec), {object containing properties to change/modify})
    //can call gsap.to() multiple times for multiple elements
    /*     gsap.to(revealImg, 1, { x: "100%" });
    gsap.to(img, 1, { scale: 2 }); */

    //create a timeline to execute animations on multiple elements
    //add a chain of animation so that they don't run together at the same time
    //defaults: {duration: 1} = we are specifying the default duration in sec for the animation; this way
    //we wont have to define the duration repeatedly for each animation
    const slideTl = gsap.timeline({
      defaults: {
        duration: 1,
        ease: "power2.inOut",
      },
    });
    //with fromTo we define an object to where the animation starts "from" in the second argument ;
    // and then define another object where the animation should go "to"
    //example below is moving the cover for the image from x:0% to x:100%
    slideTl.fromTo(revealImg, { x: "0%" }, { x: "100%" });
    //once the above animation has complete,
    //the below scales the image down from 1.5 to 1 (image was not initially scaled to 1.5)
    //if I want to animate the below animation at the same time as the first animation above,
    //include "-=1" at the end of inside bracket ; the closer to 1 the quicker the next animation triggers
    slideTl.fromTo(img, { scale: 1.5 }, { scale: 1 });
    slideTl.fromTo(revealText, { x: "0%" }, { x: "100%" }, "-=0.65");
    slideTl.fromTo(nav, { y: "-100%" }, { y: "0%" }, "-=0.5");

    //Create Scene to animate when we scroll
    slideScene = new ScrollMagic.Scene({
      //want to animate on every slide or section
      triggerElement: slide,
      //the trigger point to where the animation begins. 0.25 refers to 1/4 way down of the screen
      triggerHook: 0.25,
      //when we move away after trigger and animation takes place, it goes back to the orginal state (i.e. hidden slide)
      //reverse false prevents it from going back to the original state after scrolling away
      reverse: false,
    })
      //setTween, passes in the timeline of animations from slideTl
      .setTween(slideTl)
      .addIndicators({ colorStart: "white", colorTrigger: "green", name: "slide" })
      .addTo(controller);

    //New Animation - PageTl
    const pageTl = gsap.timeline();
    //Using the nextSlide method, we dont want the opacity effect to happen immediately when we scroll
    //We want to delay a bit to give the reader a moment to read content when scrolling
    let nextSlide = slides.length - 1 === index ? "end" : slides[index + 1];
    //We grab the next slide as we scroll and move it up, through y pos movement, by 50%
    //At this point the current slide is still visible
    pageTl.fromTo(nextSlide, { y: "0%" }, { y: "50%" });
    //We then activate the current slide opacity effect to fade away
    pageTl.fromTo(slide, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.5 });
    //We then reset the y pos of the next slide back to 0 for normal scrolling
    //Include -=0.5 for the next slide to appear quicker
    pageTl.fromTo(nextSlide, { y: "50%" }, { y: "0%" }, "-=0.5");

    //Create new Scene
    pageScene = new ScrollMagic.Scene({
      triggerElement: slide,
      //duration 100% means that the animation will last the whole height of the slide
      duration: "100%",
      //trigger point on the screen to activate the animation.
      //in this example, trigger point 0 is at the top of the browser screen
      //when "start pagee" indicator meets the yellow "trigger" indicator on screen,
      //the setPin method is triggered, followed by setTween PageTl method
      triggerHook: 0,
    })
      .addIndicators({ colorStart: "pink", colorTrigger: "yellow", name: "pageee", indent: 200 })
      //setPin, pins the "slide" section on the screen
      //As we scroll, the next section overlaps the previous section
      //We are scrolling however we see one section at a time.
      //Once we have scrolled away from the section trigger point, the next section displays and animates
      //We also get a massive space/gap when scrolling between the sections, you have to scroll through the
      //space/gap to get to the next section
      //To remove this and get a clen overlap when scrolling, we include pushFollowers:false
      .setPin(slide, { pushFollowers: false })
      //when we scroll halfway (y:50%) the second slide start to overlap
      .setTween(pageTl)
      .addTo(controller);
  });
}

//get the custom cursor that we created
const mouse = document.querySelector(".cursor");
const mouseTxt = mouse.querySelector("span");
const burger = document.querySelector(".burger");

function cursor(e) {
  console.log(e);
  //customise the style of the cursor
  //customisation is set so that wherever the mouse moves (through "mousemove" eventlistener)
  //the cursor's position is adjusted to the same position
  //this is done through overwriting the cursor's top & left position with the current mouse position through pageY & pageX
  mouse.style.top = e.pageY + "px";
  mouse.style.left = e.pageX + "px";
}

function activeCursor(e) {
  const item = e.target;
  if (item.id === "logo" || item.classList.contains("burger")) {
    mouse.classList.add("nav-active");
  } else {
    mouse.classList.remove("nav-active");
  }

  if (item.classList.contains("explore")) {
    mouse.classList.add("explore-active");
    //Original position of title-swipe i.e. the colour blend area, only covers the last line of the title which is "fingertips"
    //Use gsap to to move title-swipe area up, once you hover over explore
    //Full title will be covered with the colour blend
    // 1 represents 1 second duration
    gsap.to(".title-swipe", 1, { y: "0%" });
    mouseTxt.innerText = "Tap";
  } else {
    mouse.classList.remove("explore-active");
    mouseTxt.innerText = "";
    //Move the title-swipe colour blend area back to original position of the last line of the title
    gsap.to(".title-swipe", 1, { y: "100%" });
  }
}

//When we click on the burger menu, we display the nav-bar page
//This function toggles between the main page and the nav-bar page when we click on the burger menu
//When we click on the burger menu, we add the class "active" and run the animation to display the nav-bar page
//We click on the burger menu again to remove the "active" class and display the main page
function navToggle(e) {
  if (!e.target.classList.contains("active")) {
    e.target.classList.add("active");
    //add animations to the burger lines and rotate by 45/-45 degrees and move down/move up respectively
    gsap.to(".line1", 0.5, { rotate: "45", y: 5, background: "black" });
    gsap.to(".line2", 0.5, { rotate: "-45", y: -5, background: "black" });
    gsap.to("#logo", 1, { color: "black" });
    //display the nav-bar page, englarging the visibility through the clipPath styling
    gsap.to(".nav-bar", 1, { clipPath: "circle(2500px at 100% -10%)" });
    //hides the scrolling for the navbar page
    document.body.classList.add("hide");
  } else {
    e.target.classList.remove("active");
    gsap.to(".line1", 0.5, { rotate: "0", y: 0, background: "white" });
    gsap.to(".line2", 0.5, { rotate: "0", y: 0, background: "white" });
    gsap.to("#logo", 1, { color: "white" });
    //revert back to original clipPath styling set on style.css for nav-bar
    gsap.to(".nav-bar", 1, { clipPath: "circle(50px at 100% -10%)" });
    document.body.classList.remove("hide");
  }
}

//Barba Page Transitions
//Define objects with an array of objects inside the barba.init

/* Issue:
Page transitions work below however, with the barba transitions, we are only updating 
the <main> content which means the hyperlinks in the navbar will not be updated in accordance to
the directory path. When we transition to fahsion page, the href link for "days" logo will need to be updated
to the correct path */
//To fix this we will set the default directory location for the logo href
//and update the logo href dynamically, when we enter the fashion page
const logo = document.querySelector("#logo");

barba.init({
  views: [
    //define the pages we want to transition in
    //2 pages we have are defined in namespace (home and fashion)
    //We can define what functions run on each page
    //ScrollMagic function on animateSlides() , runs on the fahsion page even though we don't need it
    //We can set animateSlides to only run on the home page
    {
      namespace: "home",
      beforeEnter() {
        animateSlides();
        //default directory location for the logo href
        logo.href = "./index.html";
      },
      //remove the functions we don't need just before we leave the home index page
      beforeLeave() {
        slideScene.destroy();
        pageScene.destroy();
        controller.destroy();
      },
    },
    {
      namespace: "fashion",
      beforeEnter() {
        detailAnimation();
        //dynamically update the logo href when we transition to the fahsion page
        logo.href = "../index.html";
        gsap.fromTo(".nav-header", 1, { y: "100%" }, { y: "0%", ease: "power2.Out" });
      },

      beforeLeave() {
        controller.destroy();
        detailScene.destroy();
      },
    },
  ],
  transitions: [
    {
      //"current" container & "next" container
      //Here we take the current "container", fade it out, then take the next "container" and fade it in
      leave({ current, next }) {
        let done = this.async();
        //this is to scroll to the top when we leave to the next page
        window.scrollTo(0, 0);
        //An animation
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        //once the current container is faded out, we tell barba to fade in the next container through "this.async"
        //gsap has a property called onComplete, which we can use to run functionality once the animation is complete
        //we can pass in "done" (this.async) to onComplete to run this.async
        //tl.fromTo(current.container, 1, { opacity: 1 }, { opacity: 0, onComplete: done });
        //this example below uses a swipte effect
        tl.fromTo(current.container, 1, { opacity: 1 }, { opacity: 0 });
        tl.fromTo(".swipe", 0.75, { x: "-100%" }, { x: "0%", onComplete: done }, "-=0.5");
      },
      enter({ current, next }) {
        let done = this.async();
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        //tl.fromTo(next.container, 1, { opacity: 0 }, { opacity: 1, onComplete: done });
        //above removed for swipe effect
        tl.fromTo(
          //stagger property grabs each swipe div and delays the transition of each swipe, onto the page
          ".swipe",
          1,
          { x: "0%" },
          //stagger will delay each swipe one by one by 0.25s. short delay in-between each swipe apperaing
          { x: "100%", stagger: 0.25, onComplete: done }
        );
        tl.fromTo(next.container, 1, { opacity: 0 }, { opacity: 1 });
      },
    },
  ],
});

function detailAnimation() {
  controllerDA = new ScrollMagic.Controller();
  const slides = document.querySelectorAll(".detail-slide");
  slides.forEach((slide, index, slides) => {
    const slideTl = gsap.timeline({
      defaults: {
        duration: 1,
      },
    });

    //Transition fade from one slide to another when we scroll down
    let nextSlide = slides.length - 1 === index ? "end" : slides[index + 1];
    const nextImg = nextSlide.querySelector("img");
    slideTl.fromTo(slide, { opacity: 1 }, { opacity: 0 });
    slideTl.fromTo(nextSlide, { opacity: 0 }, { opacity: 1 }, "-=1");
    slideTl.fromTo(nextImg, { x: "50%" }, { x: "0%" });

    //Scene
    detailScene = new ScrollMagic.Scene({
      triggerElement: slide,
      duration: "100%",
      triggerHook: 0,
    })
      .setPin(slide, { pushFollowers: false })
      .setTween(slideTl)
      .addIndicators({ colorStart: "green", colorTrigger: "yellow", name: "detailScene" })
      .addTo(controllerDA);
  });
}

//EventListeners
burger.addEventListener("click", navToggle);
window.addEventListener("mousemove", cursor);
window.addEventListener("mouseover", activeCursor);
