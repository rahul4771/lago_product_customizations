import React, {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useRef,
} from 'react';
import { Button, Select } from '@shopify/polaris';
import { useRouter } from 'next/router';
import AbortController from 'abort-controller';
import { Spinner } from '@shopify/polaris';
import TrashImage from '../../images/trash-6-xxl.png';
import RotationImage from '../../images/rotation.png';
import ExpandArrow from '../../images/expand-arrow.png';
import ResizeArrow from '../../images/resize-arrow.png';
import IconDown from '../../images/icon_down.png';
import html2canvas from 'html2canvas';
import IconUp from '../../images/icon_up.png';
import IconLeft from '../../images/icon_left.png';
import IconRight from '../../images/icon_right.png';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Helper from '../../helpers/helpers';

let customizationStorage = {};
let side = 'front';
let artImagesArray = {};
let artCount = 0;
let leftCount = 14;
let topCount = 75;
let frontObject = [];
let backObject = [];
let sleeveObject = [];
let img_height = '';
let img_width = '';
let productSide = 'front';
let nudgeArtId = null;
let arrow = true;
let lazy = true;
let swap = false;
const PlaceArtwork = (props) => {
  const router = useRouter();
  const product = props.product;
  const assignArtwork = props.artwork;
  const orderType = props.type;
  const [loading, setLoading] = useState(true);
  const [latestArtCount, setLatestArtCount] = useState('');
  const [artworkInstruction, setArtworkInstruction] = useState('');
  const [activeArtwork, setActiveArtwork] = useState('');
  const [artImages, setArtImages] = useState({});
  const [artSelect, setArtSelect] = useState('');
  const [selectedColor, setSelectedColor] = useState('1');
  const [totalColor, setTotalColor] = useState([]);
  let setSignal = null;
  let controller = null;
  let previewResult = [];
  let getCanvas = null;
  const [isFrontButtonActive, setIsFrontButtonActive] = useState(true);
  const [isBackButtonActive, setIsBackButtonActive] = useState(false);
  const [isSleeveButtonActive, setIsSleeveButtonActive] = useState(false);
  const instructionRef = useRef(null);
  const sliderRef = useRef();
  const [running, setRunning] = useState(true);
  const [imageSized, setImageSized] = useState('');
  const isCancelled = useRef(false);
  const handleOnClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
      return;
    }
    $('.slick-track').css('transform', 'translate3d(0px, 0px, 0px)');
  };
  let settings = {
    dots: false,
    infinite: false,
    lazyLoad: lazy,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: arrow,
    swipe: false,
    waitForAnimate: false,
  };
  const handleFrontButtonClick = useCallback(() => {
    setIsFrontButtonActive(true);
    setIsBackButtonActive(false);
    setIsSleeveButtonActive(false);
    arrow = true;
    lazy = true;
  }, [isFrontButtonActive]);
  const handleBackButtonClick = useCallback(() => {
    setIsFrontButtonActive(false);
    setIsBackButtonActive(true);
    setIsSleeveButtonActive(false);
    arrow = true;
    lazy = true;
  }, [isBackButtonActive]);
  const handleSleeveButtonClick = useCallback(() => {
    setIsFrontButtonActive(false);
    setIsBackButtonActive(false);
    setIsSleeveButtonActive(true);
    arrow = true;
    lazy = true;
  }, [isSleeveButtonActive]);

  const instructionClickHandle = () => {
    if (document.activeElement === instructionRef.current) {
      setRunning(false);
      return;
    }
    setRunning(true);
  };

  const artworkHandler = (eventId, artWorkSelected) => {
    if (eventId && $('.place__artwork_modal').length > 0) {
      $('.art-preview').css('border', '0.1rem solid var(--p-divider)');
      $('#art-preview-' + artWorkSelected).css(
        'border',
        '3px solid rgb(69, 143, 255)',
      );
      $('.resizable').removeClass('art-preview-select');
      $('#' + artWorkSelected).addClass('art-preview-select');
      setActiveArtwork(artWorkSelected);
      nudgeArtId = artWorkSelected;
      const angle = $(`#${artWorkSelected} .rotation`)
        .eq(0)
        .attr('data-rotation')
        ? $(`#${artWorkSelected} .rotation`)
            .eq(0)
            .attr('data-rotation')
            .replace(/[^\d\.]*/g, '')
        : 0;
      if (
        Math.abs(Math.round(angle * (180 / Math.PI))) > 45 &&
        Math.abs(Math.round(angle * (180 / Math.PI))) < 135
      ) {
        swap = true;
      } else {
        swap = false;
      }
      let instruction = $('#' + artWorkSelected).attr('data-instruction');
      $('.instruction-text').val(instruction);
      let artSelectColor = $('#' + artWorkSelected).attr('data-artColor');
      let artTotalColor = $('#' + artWorkSelected).attr('data-totalArtColor');
      setSelectedColor(artSelectColor);
      let options = [];
      for (let i = 1; i <= artTotalColor; ++i) {
        options.push({
          label: '' + i + '',
          value: '' + i + '',
        });
      }
      setTotalColor(options);
      artWorkSelected = '';
      let sizedImg = product.image.src;
      let sizedImgExt = sizedImg.split('?')[0].split('.').pop();
      sizedImg = sizedImg.replace('.' + sizedImgExt, '_360x.' + sizedImgExt);
      setImageSized(sizedImg);
    }
  };

  const clickHandler = (status) => {
    if (!status) {
      setRunning(false);
      return;
    }
    setRunning(true);
  };

  let leftDown, rightDown, upDown, downDown, leftKey, upKey, rightKey, downKey;
  let left = 37,
    up = 38,
    right = 39,
    down = 40;

  let holdingLeft = false;
  let holdingRight = false;
  let holdingUp = false;
  let holdingDown = false;

  $('#customization-element').css('opacity', 'none');
  $('.slick-slider').css('width', '100%');

  useEffect(() => {
    isCancelled.current = false;
    side = productSide ? productSide : side;
    frontObject = [];
    backObject = [];
    sleeveObject = [];
    (async () => {
      if (orderType == 'orderUpdate') {
        router.prefetch(
          '/header?tab=create-PO&page=editAssignArtwork&params=' +
            JSON.stringify({ orderId: props.orderId, productId: product.id }),
        );
      } else {
        router.prefetch(
          '/header?tab=create-PO&page=assignArtwork&params=' + product.id,
        );
      }
      try {
        $('.Polaris-Spinner--sizeLarge').css('display', 'none');
        $('.Polaris-Spinner--sizeLarge').css('position', 'fixed');
        $('.Polaris-Spinner--sizeLarge').css('width', '100%');
        $('.Polaris-Spinner--sizeLarge').css('top', '220px');
        $('.Polaris-Spinner--sizeLarge').css('text-align', 'center');
        customizationStorage = {};
        await getCustomization();
        if (
          customizationStorage[side] != undefined &&
          Object.keys(customizationStorage[side].art_image_array).length > 0
        ) {
          artImagesArray = customizationStorage[side].art_image_array;
          setArtImages(artImagesArray);
        } else {
          artImagesArray = {};
          setArtImages(artImagesArray);
        }
        controller = new AbortController();
        setSignal = controller.signal;
        setArtContainer(assignArtwork);
      } catch (e) {
        console.log(e);
      }
    })();
    $('.art-preview').closest('.slick-slide').removeClass('removed');
    $('.art-preview').closest('.slick-slide').css('display', 'block');
    return () => {
      isCancelled.current = true;
      if (setSignal) {
        controller.abort();
      }
    };
  }, [props.uniqueKey, productSide]);

  useEffect(() => {
    side = productSide ? productSide : side;
    if (
      customizationStorage[side] != undefined &&
      Object.keys(customizationStorage[side].art_image_array).length > 0
    ) {
      artImagesArray = customizationStorage[side].art_image_array;
      setArtImages(artImagesArray);
    } else {
      artImagesArray = {};
      setArtImages(artImagesArray);
    }
    $('.art-preview').closest('.slick-slide').removeClass('removed');
    $('.art-preview').closest('.slick-slide').css('display', 'block');
    handleOnClick(0);
  }, [productSide]);

  /* function to set the customization object of an art */
  function setContainerCustomization(side) {
    let elements;
    if (side == 'front') {
      elements = Object.assign(
        {},
        {
          width: $('#front-container').css('width'),
          height: $('#front-container').css('height'),
          left: $('#front-container').css('left'),
          top: $('#front-container').css('top'),
        },
      );
    }
    if (side == 'back') {
      elements = Object.assign(
        {},
        {
          width: $('#back-container').css('width'),
          height: $('#back-container').css('height'),
          left: $('#back-container').css('left'),
          top: $('#back-container').css('top'),
        },
      );
    }
    if (side == 'sleeve') {
      elements = Object.assign(
        {},
        {
          width: $('#sleeve-container').css('width'),
          height: $('#sleeve-container').css('height'),
          left: $('#sleeve-container').css('left'),
          top: $('#sleeve-container').css('top'),
        },
      );
    }
    customizationStorage[side].containerCustomization = elements;
  }
  /* function to set the customization object of an art */
  function setCustomization(element, type, side) {
    let elements;
    let containerProps;
    if (type == 'image') {
      if (side == 'front') {
        frontObject[element] = {
          id: $('#' + element).attr('data-artId'),
          name: $('#' + element).attr('data-artName'),
          type: $('#' + element).attr('data-artType'),
          color: $('#' + element).attr('data-artColor'),
          color_total: $('#' + element).attr('data-totalArtColor'),
          instruction: $('#' + element).attr('data-instruction'),
          image_url: $('#' + element).css('background-image'),
          thumbnail_url: $('#' + element).attr('data-thumbnail_url'),
          image_width: $('#' + element).css('width'),
          image_height: $('#' + element).css('height'),
          image_position_x: $('#' + element).css('left'),
          image_position_y: $('#' + element).css('top'),
          image_rotation: $('#' + element + ' .rotation')
            .eq(0)
            .attr('data-rotation'),
        };
        elements = Object.assign({}, frontObject);
        containerProps = Object.assign(
          {},
          {
            width: $('#front-container').css('width'),
            height: $('#front-container').css('height'),
            left: $('#front-container').css('left'),
            top: $('#front-container').css('top'),
          },
        );
      }
      if (side == 'back') {
        backObject[element] = {
          id: $('#' + element).attr('data-artId'),
          name: $('#' + element).attr('data-artName'),
          type: $('#' + element).attr('data-artType'),
          color: $('#' + element).attr('data-artColor'),
          color_total: $('#' + element).attr('data-totalArtColor'),
          instruction: $('#' + element).attr('data-instruction'),
          image_url: $('#' + element).css('background-image'),
          thumbnail_url: $('#' + element).attr('data-thumbnail_url'),
          image_width: $('#' + element).css('width'),
          image_height: $('#' + element).css('height'),
          image_position_x: $('#' + element).css('left'),
          image_position_y: $('#' + element).css('top'),
          image_rotation: $('#' + element + ' .rotation')
            .eq(0)
            .attr('data-rotation'),
        };
        elements = Object.assign({}, backObject);
        containerProps = Object.assign(
          {},
          {
            width: $('#back-container').css('width'),
            height: $('#back-container').css('height'),
            left: $('#back-container').css('left'),
            top: $('#back-container').css('top'),
          },
        );
      }
      if (side == 'sleeve') {
        sleeveObject[element] = {
          id: $('#' + element).attr('data-artId'),
          name: $('#' + element).attr('data-artName'),
          type: $('#' + element).attr('data-artType'),
          color: $('#' + element).attr('data-artColor'),
          color_total: $('#' + element).attr('data-totalArtColor'),
          instruction: $('#' + element).attr('data-instruction'),
          image_url: $('#' + element).css('background-image'),
          thumbnail_url: $('#' + element).attr('data-thumbnail_url'),
          image_width: $('#' + element).css('width'),
          image_height: $('#' + element).css('height'),
          image_position_x: $('#' + element).css('left'),
          image_position_y: $('#' + element).css('top'),
          image_rotation: $('#' + element + ' .rotation')
            .eq(0)
            .attr('data-rotation'),
        };
        elements = Object.assign({}, sleeveObject);
        containerProps = Object.assign(
          {},
          {
            width: $('#sleeve-container').css('width'),
            height: $('#sleeve-container').css('height'),
            left: $('#sleeve-container').css('left'),
            top: $('#sleeve-container').css('top'),
          },
        );
      }
      customizationStorage[side] = {
        product_image: $('#' + side + '-canvas').css('background-image'),
        art_image_status: true,
        art_image_array: elements,
        containerCustomization: containerProps,
      };
    }
  }

  /* function to set art container */
  const setArtContainer = async (assignArtwork) => {
    artCount = artCount + 1;
    let topCountSet = 75;
    let leftCountSet = 14;
    let customizationInfoData = localStorage.getItem('customizationInfo');
    if (customizationInfoData) {
      customizationInfoData = JSON.parse(customizationInfoData);
      var customizationElements = customizationInfoData.customization_elements;
    }
    let artContainerWidth =
      Number(
        $('#' + side + '-container')
          .css('width')
          .slice(0, -2),
      ) / 2;
    $.each(customizationElements, function (key, artElements) {
      if (key == side) {
        let arts = artElements.art_image_array;
        let sideContainer = artElements.containerCustomization;
        $('#' + side + '-container').css('height', sideContainer.height);
        $('#' + side + '-container').css('left', sideContainer.left);
        $('#' + side + '-container').css('top', sideContainer.top);
        $('#' + side + '-container').css('width', sideContainer.width);
        let length = Object.keys(arts).length;
        topCountSet = topCount + length * 10;
        leftCountSet = leftCount + length * 5;
        artContainerWidth = sideContainer.width.slice(0, -2) / 2;
      }
    });
    let topCountPx = topCountSet + 'px';
    let leftCountPx = leftCountSet + 'px';
    setLatestArtCount(artCount);
    setActiveArtwork('art' + artCount);
    setArtSelect('art' + artCount);
    let options = [];
    for (let i = 1; i <= assignArtwork.artwork_colors; ++i) {
      options.push({ label: '' + i + '', value: '' + i + '' });
    }
    setSelectedColor('1');
    setTotalColor(options);
    var imageW = new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () =>
        resolve({ img_width: img.width, img_height: img.height });
      img.onerror = reject;
      img.src = assignArtwork.artwork_url;
    });
    imageW.then((result) => {
      img_width = result.img_width;
      img_height = result.img_height;
      if (side == 'sleeve') {
        if (Number(img_width) > Number(img_height)) {
          let ratio = Number(img_width / img_height);
          img_width = Number(ratio * artContainerWidth);
          img_height = artContainerWidth;
        } else if (Number(img_width) == Number(img_height)) {
          img_width = artContainerWidth;
          img_height = artContainerWidth;
        } else {
          let ratio = Number(img_height / img_width);
          img_height = Number(ratio * artContainerWidth);
          img_width = artContainerWidth;
        }
      } else {
        if (Number(img_width) > Number(img_height)) {
          let ratio = Number(img_width / img_height);
          img_width = Number(ratio * artContainerWidth);
          img_height = artContainerWidth;
        } else if (Number(img_width) == Number(img_height)) {
          img_width = artContainerWidth;
          img_height = artContainerWidth;
        } else {
          let ratio = Number(img_height / img_width);
          img_height = Number(ratio * artContainerWidth);
          img_width = artContainerWidth;
        }
      }
      let widthpx = img_width + 'px';
      let heightpx = img_height + 'px';
      let artHtml =
        "<div id='art" +
        artCount +
        "' class='resizable draggable' data-type='image' data-artId='" +
        assignArtwork.id +
        "' data-thumbnail_url='" +
        assignArtwork.thumbnail_url +
        "' data-artName='" +
        assignArtwork.artwork_name +
        "' data-artType='" +
        assignArtwork.artwork_type +
        "' data-artColor='1' data-totalArtColor='" +
        assignArtwork.artwork_colors +
        "' data-instruction='' style='height:" +
        heightpx +
        ';width:' +
        widthpx +
        ';background-image:url(' +
        assignArtwork.artwork_url +
        ');' +
        'background-size: contain;background-repeat: no-repeat;background-position: center center;position: absolute;top: ' +
        topCountPx +
        ";left:0px; '  >" +
        "<div class='resizers'><span class='rotation' data-rotation=''></span>" +
        "<div class='top-left coordinal-elements' style='background-image: url(" +
        TrashImage +
        ');' +
        "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
        "<div class='resizer top-right coordinal-elements' style='background-image: url(" +
        ExpandArrow +
        ');' +
        "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
        "<div id='bottom-left" +
        artCount +
        "' class='bottom-left coordinal-elements' style='background-image: url(" +
        RotationImage +
        ');' +
        "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
        "<div class='resizer bottom-right coordinal-elements' style='background-image: url(" +
        ResizeArrow +
        ');' +
        "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
        '</div></div>';
      $('#' + side + '-container').append(artHtml);
      $('#art-preview-art' + artCount).css('display', 'block');
      setCustomization('art' + artCount, 'image', side);
      $('#art-preview-art' + artCount).trigger('click');

      /* function to drag an element */
      window.$('.draggable, .resizable, .changeMe').draggable({
        containment: 'x,y',
        drag: function (event, ui) {
          let element = $(this).attr('id');
          let type = $(this).data('type');
          resizeContainer(event, ui);
          setCustomization(element, type, side);
        },
      });

      /* Function to resize an element */
      window.$('.resizable').resizable({
        containment: 'parent',
        handles: 'e, s, n, w, ne, se',
        aspectRatio: true,
        resize: function (event, ui) {
          let element = $(this).attr('id');
          let type = $(this).data('type');
          setCustomization(element, type, side);
        },
      });

      /* function to drag an element */
      window.$('.draggableNew, .resizableNew, .changeMe').draggable({
        containment: 'parent',
        aspectRatio: false,
        drag: function () {
          setContainerCustomization(side);
        },
      });

      /* Function to resize an element */
      window.$('.resizableNew').resizable({
        containment: 'parent',
        handles: 'e, s, n, w, ne, se',
        aspectRatio: false,
        resize: function (event, ui) {
          setContainerCustomization(side);
        },
      });

      $(document).on('click', '.resizable', function (event) {
        if ($('.place__artwork_modal').length > 0) {
          let element = $(this).attr('id');
          artworkHandler(event.target.id, element);
        }
      });
    });
  };

  $(document).ready(function () {
    /* Rotation */
    function getCenter(element) {
      const { left, top, width, height } = element.getBoundingClientRect();
      return { x: left + width / 2, y: top + height / 2 };
    }
    let angle;
    let art;
    let flag;
    $('body').on('click', '.bottom-left', function () {
      flag = 1;
      let elementGet = $(this).attr('id');
      art = document.querySelector('#' + elementGet).closest('.resizable');
      const artCenter = getCenter(art);
      addEventListener('mousemove', ({ clientX, clientY }) => {
        if (flag == 1) {
          angle = Math.atan2(clientY - artCenter.y, clientX - artCenter.x);
          art.style.transform = `rotate(${angle}rad)`;
          if (
            Math.abs(Math.round(angle * (180 / Math.PI))) > 45 &&
            Math.abs(Math.round(angle * (180 / Math.PI))) < 135
          ) {
            swap = true;
          } else {
            swap = false;
          }
          let element = $(art).attr('id');
          let type = $(art).data('type');
          $('#' + element + ' .rotation').attr(
            'data-rotation',
            `rotate(${angle}rad)`,
          );
          setCustomization(element, type, side);
        }
      });
    });

    $(document).click(function (event) {
      let element = $(event.target).attr('class');
      if (element)
        if (element.indexOf('bottom-left') < 0) {
          flag = 0;
        }
    });

    /* Delete Art */
    $(document).on('click', '.top-left', function () {
      if ($('.place__artwork_modal').length > 0) {
        let obj = $(this).closest('.resizable');
        let element = $(obj).attr('id');
        if (document.getElementById(element)) {
          if (side == 'front') {
            delete frontObject[element];
          }
          if (side == 'back') {
            delete backObject[element];
          }
          if (side == 'sleeve') {
            delete sleeveObject[element];
          }

          $('#art-preview-' + element)
            .closest('.slick-slide')
            .addClass('removed');
          $('#art-preview-' + element)
            .closest('.slick-slide')
            .css('display', 'none');
          $(this).closest('.resizable').remove();
          lazy = false;
          if ($('.slick-slide').not('.removed').length < 4) {
            arrow = false;
            handleOnClick(0);
          }
          if (customizationStorage[side]['art_image_array'][element]) {
            delete customizationStorage[side]['art_image_array'][element];
            if (
              Object.keys(customizationStorage[side]['art_image_array'])
                .length < 4
            ) {
              arrow = false;
              handleOnClick(0);
            }
            let [firstArtworkKey] = Object.keys(
              customizationStorage[side].art_image_array,
            );
            $('#art-preview-' + firstArtworkKey).click();
          }
        }
      }
    });
  });

  async function getCustomization() {
    $('#front-container').html('');
    $('#back-container').html('');
    $('#sleeve-container').html('');
    let customizationInfoData = localStorage.getItem('customizationInfo');
    if (customizationInfoData) {
      customizationInfoData = JSON.parse(customizationInfoData);
      let customizationElements = customizationInfoData.customization_elements;
      if (productSide == '') {
        if ('front' in customizationElements) {
          side = 'front';
        } else if ('back' in customizationElements) {
          side = 'back';
        } else if ('sleeve' in customizationElements) {
          side = 'sleeve';
        }
      }
      $('#art-preview-art1').click();
      $('#' + side + '_button').click();
      $('.sides').css('display', 'none');
      $('#' + side).css('display', 'block');
      $('.sides-div').removeClass('selected');
      $('#' + side + '-div').addClass('selected');
      artCount = 0;
      $.each(customizationElements, function (key, artElements) {
        if (artElements.art_image_status) {
          $('#' + key + '-canvas').css(
            'background-image',
            artElements.product_image,
          );
          let arts = artElements.art_image_array;
          $.each(arts, function (index, art_image_data) {
            artCount = artCount + 1;
            let artHtml =
              "<div id='art" +
              artCount +
              "' class='resizable draggable' data-type='image' data-artId='" +
              art_image_data.id +
              "' data-thumbnail_url='" +
              art_image_data.thumbnail_url +
              "' data-artName='" +
              art_image_data.name +
              "' data-artType='" +
              art_image_data.type +
              "' data-artColor='" +
              art_image_data.color +
              "' data-totalArtColor='" +
              art_image_data.color_total +
              "' " +
              "' data-instruction='" +
              Helper.escapeHtml(art_image_data.instruction) +
              "' style='background-image:" +
              art_image_data.image_url +
              ';' +
              "background-size: contain;background-repeat: no-repeat;background-position: center center;position: absolute;'>" +
              "<div class='resizers'><span class='rotation' data-rotation=''></span>" +
              "<div class='top-left coordinal-elements' style='background-image: url(" +
              TrashImage +
              ');' +
              "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
              "<div class='resizer top-right coordinal-elements' style='background-image: url(" +
              ExpandArrow +
              ');' +
              "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
              "<div id='bottom-left" +
              artCount +
              "' class='bottom-left coordinal-elements' style='background-image: url(" +
              RotationImage +
              ');' +
              "background-size:contain;background-repeat: no-repeat;background-position: center center;'></div>" +
              "<div class='resizer bottom-right coordinal-elements' style='background-image: url(" +
              ResizeArrow +
              ');' +
              "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
              '</div></div>';
            $('#' + key + '-container').append(artHtml);
            $('#art' + artCount).css('width', art_image_data.image_width);
            $('#art' + artCount).css('height', art_image_data.image_height);
            $('#art' + artCount).css('left', art_image_data.image_position_x);
            $('#art' + artCount).css('top', art_image_data.image_position_y);
            $('#art' + artCount).css(
              'transform',
              art_image_data.image_rotation,
            );
            $('#art' + artCount + ' .rotation').attr(
              'data-rotation',
              art_image_data.image_rotation,
            );
            setCustomization('art' + artCount, 'image', key);
          });
        }
      });

      /* declaring rotation element */
      let rotationElement = document.querySelector('.bottom-left');
      if (rotationElement) {
        rotationElement.style.cursor = 'pointer';
      }

      /* function to drag an element */
      $('.draggable, .resizable, .changeMe').draggable({
        containment: 'x,y',
        drag: function (event, ui) {
          let element = $(this).attr('id');
          let type = $(this).data('type');
          resizeContainer(event, ui);
          setCustomization(element, type, side);
        },
      });

      /* Function to resize an element */
      $('#draggable, .resizable').resizable({
        containment: 'parent',
        handles: 'e, s, n, w, ne, se',
        aspectRatio: true,
        resize: function (event, ui) {
          let element = $(this).attr('id');
          let type = $(this).data('type');
          setCustomization(element, type, side);
        },
      });

      /* function to drag an element */
      $('.draggableNew, .resizableNew, .changeMe').draggable({
        containment: 'parent',
        aspectRatio: false,
        drag: function () {
          setContainerCustomization(side);
        },
      });

      /* Function to resize an element */
      $('#draggableNew, .resizableNew').resizable({
        containment: 'parent',
        handles: 'e, s, n, w, ne, se',
        aspectRatio: false,
        resize: function (event, ui) {
          setContainerCustomization(side);
        },
      });

      /* Rotation */
      function getCenter(element) {
        const { left, top, width, height } = element.getBoundingClientRect();
        return { x: left + width / 2, y: top + height / 2 };
      }

      let angle;
      let art;
      let flag;

      $('body').on('click', '.bottom-left', function () {
        flag = 1;
        let elementGet = $(this).attr('id');
        art = document.querySelector('#' + elementGet).closest('.resizable');
        const artCenter = getCenter(art);
        addEventListener('mousemove', ({ clientX, clientY }) => {
          if (flag == 1) {
            angle = Math.atan2(clientY - artCenter.y, clientX - artCenter.x);
            art.style.transform = `rotate(${angle}rad)`;
            if (
              Math.abs(Math.round(angle * (180 / Math.PI))) > 45 &&
              Math.abs(Math.round(angle * (180 / Math.PI))) < 135
            ) {
              swap = true;
            } else {
              swap = false;
            }
            let element = $(art).attr('id');
            let type = $(art).data('type');
            $('#' + element + ' .rotation').attr(
              'data-rotation',
              `rotate(${angle}rad)`,
            );
            setCustomization(element, type, side);
          }
        });
      });

      $(document).click(function (event) {
        let element = $(event.target).attr('class');
        if (element)
          if (element.indexOf('bottom-left') < 0) {
            flag = 0;
          }
      });

      /* Delete Art */
    }
  }

  const deleteArtElement = (currentSide, art) => {
    if (currentSide != 'front') {
      if (
        customizationStorage['front'] !== undefined &&
        customizationStorage['front']['art_image_array'] !== undefined
      ) {
        if (
          customizationStorage['front']['art_image_array']['art' + art] !==
          undefined
        ) {
          delete customizationStorage['front']['art_image_array']['art' + art];
        }
      }
    }
    if (currentSide != 'back') {
      if (
        customizationStorage['back'] !== undefined &&
        customizationStorage['back']['art_image_array'] !== undefined
      ) {
        if (
          customizationStorage['back']['art_image_array']['art' + art] !==
          undefined
        ) {
          delete customizationStorage['back']['art_image_array']['art' + art];
        }
      }
    }
    if (currentSide != 'sleeve') {
      if (
        customizationStorage['sleeve'] !== undefined &&
        customizationStorage['sleeve']['art_image_array'] !== undefined
      ) {
        if (
          customizationStorage['sleeve']['art_image_array']['art' + art] !==
          undefined
        ) {
          delete customizationStorage['sleeve']['art_image_array']['art' + art];
        }
      }
    }
  };

  const placeArt = async () => {
    $('.resizable').removeClass('art-preview-select');
    localStorage.removeItem('preview');
    $('.Polaris-Modal-Dialog__Container').css('z-index', '517');
    $(window).scrollTop(0);
    $('.Polaris-Spinner--sizeLarge').css('display', 'block');
    $('.Polaris-Spinner--sizeLarge').css('z-index', '9999');
    let customizationInfoData = {
      product_id: product.id,
      customization_elements: Object.assign({}, customizationStorage),
    };
    localStorage.setItem(
      'customizationInfo',
      JSON.stringify(customizationInfoData),
    );
    $('.coordinal-elements').css('background-image', 'none');
    $('.coordinal-elements').css('background-size', 'none');
    $('.coordinal-elements').css('background-repeat', 'none');
    $('.coordinal-elements').css('background-position', 'none');
    $('#custom_area').addClass('custom-area');
    switch (productSide) {
      case 'front':
        $('#back-hide').addClass('side-hide');
        $('#sleeve-hide').addClass('side-hide');
        break;
      case 'back':
        $('#front-hide').addClass('side-hide');
        $('#sleeve-hide').addClass('side-hide');
        break;
      case 'sleeve':
        $('#back-hide').addClass('side-hide');
        $('#front-hide').addClass('side-hide');
        break;
      default:
        $('#back-hide').addClass('side-hide');
        $('#sleeve-hide').addClass('side-hide');
        break;
    }
    $('#front').css('display', 'block');
    $('#back').css('display', 'block');
    $('#sleeve').css('display', 'block');
    let frontContainer = document.getElementById('front-canvas');
    let backContainer = document.getElementById('back-canvas');
    let sleeveContainer = document.getElementById('sleeve-canvas');
    let previewResult = [];
    const previewFront = preview(frontContainer);
    const previewBack = preview(backContainer);
    const previewSleeve = preview(sleeveContainer, 'sleeve');
    const response = await Promise.all([
      previewFront,
      previewBack,
      previewSleeve,
    ]);
    previewResult['front'] = response[0];
    previewResult['back'] = response[1];
    previewResult['sleeve'] = response[2];
    let preview_obj = Object.assign({}, previewResult);
    localStorage.setItem('preview', JSON.stringify(preview_obj));
    setTimeout(function () {
      $('.Polaris-Spinner--sizeLarge').css('display', 'none');
      if (orderType == 'orderUpdate') {
        router.replace(
          '/header?tab=create-PO&page=editAssignArtwork&params=' +
            JSON.stringify({ orderId: props.orderId, productId: product.id }),
        );
      } else {
        router.replace(
          '/header?tab=create-PO&page=assignArtwork&params=' + product.id,
        );
      }
      document.getElementsByClassName('place__artwork_modal')[0].style.display =
        'none';
      $('.Polaris-Modal-Dialog__Container').css('z-index', '519');
    }, 500);
  };

  /* Generating the preview */
  async function preview(container, index) {
    const canvas = await html2canvas(container, {
      allowTaint: true,
      useCORS: true,
      logging: false,
    });
    getCanvas = canvas;
    let data = canvas.toDataURL('image/png');
    let image = new Image();
    image.src = data;
    return data;
    previewResult[index] = data;
  }

  $(document).keydown(function (event) {
    let clickedKeyCode = event.keyCode;
    let $key = clickedKeyCode;
    $(document)
      .keydown(function () {
        if (clickedKeyCode == left && $key != left) leftDown = true;
        if (clickedKeyCode == right && $key != right) rightDown = true;
        if (clickedKeyCode == down && $key != down) downDown = true;
        if (clickedKeyCode == up && $key != up) upDown = true;
      })
      .keyup(function () {
        if (clickedKeyCode == left) leftDown = false;
        if (clickedKeyCode == right) rightDown = false;
        if (clickedKeyCode == down) downDown = false;
        if (clickedKeyCode == up) upDown = false;
      });
    if (clickedKeyCode == left) {
      leftKey = true;
    }
    if (clickedKeyCode == up) {
      upKey = true;
    }
    if (clickedKeyCode == right) {
      rightKey = true;
    }
    if (clickedKeyCode == down) {
      downKey = true;
    }
  });

  $(document).keyup(function (event) {
    let clickedUpKeyCOde = event.keyCode;
    if (clickedUpKeyCOde == left) {
      leftKey = false;
    }
    if (clickedUpKeyCOde == up) {
      upKey = false;
    }
    if (clickedUpKeyCOde == right) {
      rightKey = false;
    }
    if (clickedUpKeyCOde == down) {
      downKey = false;
    }
  });

  $('#buttonLeft').on('mousedown', function () {
    holdingLeft = true;
    updatePos();
  });
  $('#buttonLeft').on('mouseup', function () {
    holdingLeft = false;
  });
  $('#buttonRight').on('mousedown', function () {
    holdingRight = true;
    updatePos();
  });
  $('#buttonRight').on('mouseup', function () {
    holdingRight = false;
  });
  $('#buttonUp').on('mousedown', function () {
    holdingUp = true;
    updatePos();
  });
  $('#buttonUp').on('mouseup', function () {
    holdingUp = false;
  });
  $('#buttonDown').on('mousedown', function () {
    holdingDown = true;
    updatePos();
  });
  $('#buttonDown').on('mouseup', function () {
    holdingDown = false;
  });

  function updatePos() {
    if (document.getElementById(nudgeArtId) != null) {
      let containerHeight = Number(
        $('#' + side + '-container')
          .css('height')
          .slice(0, -2),
      );
      let containerWidth = Number(
        $('#' + side + '-container')
          .css('width')
          .slice(0, -2),
      );
      let artHeight = Number(
        $('#' + nudgeArtId)
          .css('height')
          .slice(0, -2),
      );
      let artWidth = Number(
        $('#' + nudgeArtId)
          .css('width')
          .slice(0, -2),
      );
      let leftK = Number(
        $('#' + nudgeArtId)
          .css('left')
          .slice(0, -2),
      );
      let top = Number(
        $('#' + nudgeArtId)
          .css('top')
          .slice(0, -2),
      );
      let halfDimention = 0;
      let widthDifference = 0;
      let heightDifference = 0;
      let verticalDifference = 0;

      if (swap) {
        let tempHeightWidth = artHeight;
        artHeight = artWidth;
        artWidth = tempHeightWidth;
        halfDimention = artHeight - artWidth;
        halfDimention = halfDimention / 2;
      } else {
        widthDifference =
          artWidth + leftK >= containerWidth
            ? artWidth + leftK - containerWidth + 1
            : 0;
        heightDifference =
          artHeight >= artHeight + top ? artHeight - (artHeight + top) : 0;
        verticalDifference =
          artHeight + top > containerHeight
            ? artHeight + top - containerHeight
            : 0;
      }
      let heightMax = artHeight + top;
      let widthMax = artWidth + leftK;
      let absHalfDimention =
        Math.sign(halfDimention) === -1 ? Math.abs(halfDimention) : 0;
      if (holdingLeft === true) {
        if (
          !swap &&
          widthMax >= artWidth + 2 &&
          widthMax < containerWidth + widthDifference
        ) {
          leftK = Number(leftK) - 1;
          $(`#${nudgeArtId}`).css('left', `${leftK}px`);
        }
        if (
          swap &&
          widthMax + halfDimention >= artWidth + 2 &&
          widthMax - absHalfDimention < containerWidth + Math.abs(halfDimention)
        ) {
          leftK = Number(leftK) - 1;
          $(`#${nudgeArtId}`).css('left', `${leftK}px`);
        }
      }
      if (holdingRight === true) {
        if (
          !swap &&
          artWidth - widthMax + widthMax >= artWidth - 5 &&
          widthMax < containerWidth - 3
        ) {
          leftK = Number(leftK) + 1;
          $(`#${nudgeArtId}`).css('left', `${leftK}px`);
        }
        if (
          swap &&
          widthMax + Math.abs(halfDimention) >= artWidth - 5 &&
          widthMax < containerWidth - halfDimention - 3
        ) {
          leftK = Number(leftK) + 1;
          $(`#${nudgeArtId}`).css('left', `${leftK}px`);
        }
      }
      if (holdingUp === true) {
        if (
          !swap &&
          heightMax <= containerHeight + verticalDifference &&
          heightMax >= artHeight + 1
        ) {
          top = Number(top) - 1;
          $(`#${nudgeArtId}`).css('top', top + 'px');
        }
        if (
          swap &&
          heightMax <=
            containerHeight +
              halfDimention +
              (heightMax + containerHeight + halfDimention) &&
          heightMax >= artHeight + halfDimention
        ) {
          top = Number(top) - 1;
          $(`#${nudgeArtId}`).css('top', top + 'px');
        }
      }
      if (holdingDown === true) {
        if (
          swap &&
          heightMax - halfDimention < containerHeight - 3 &&
          heightMax + absHalfDimention >= artHeight - 4
        ) {
          top = Number(top) + 1;
          $(`#${nudgeArtId}`).css('top', top + 'px');
        }
        if (
          !swap &&
          heightMax < containerHeight - 3 &&
          heightMax + heightDifference >= artHeight - 4
        ) {
          top = Number(top) + 1;
          $(`#${nudgeArtId}`).css('top', top + 'px');
        }
      }
    }
  }

  useEffect(() => {
    if (running) {
      const artTimer = setInterval(() => {
        if (document.getElementById(nudgeArtId) != null) {
          let containerHeight = Number(
            $('#' + side + '-container')
              .css('height')
              .slice(0, -2),
          );
          let containerWidth = Number(
            $('#' + side + '-container')
              .css('width')
              .slice(0, -2),
          );
          let artHeight = Number(
            $('#' + nudgeArtId)
              .css('height')
              .slice(0, -2),
          );
          let artWidth = Number(
            $('#' + nudgeArtId)
              .css('width')
              .slice(0, -2),
          );
          let leftK = Number(
            $('#' + nudgeArtId)
              .css('left')
              .slice(0, -2),
          );
          let top = Number(
            $('#' + nudgeArtId)
              .css('top')
              .slice(0, -2),
          );
          let halfDimention = 0;
          let widthDifference = 0;
          let heightDifference = 0;
          let verticalDifference = 0;

          if (swap) {
            let tempHeightWidth = artHeight;
            artHeight = artWidth;
            artWidth = tempHeightWidth;
            halfDimention = artHeight - artWidth;
            halfDimention = halfDimention / 2;
          } else {
            widthDifference =
              artWidth + leftK >= containerWidth
                ? artWidth + leftK - containerWidth + 1
                : 0;
            heightDifference =
              artHeight >= artHeight + top ? artHeight - (artHeight + top) : 0;
            verticalDifference =
              artHeight + top > containerHeight
                ? artHeight + top - containerHeight
                : 0;
          }
          let heightMax = artHeight + top;
          let widthMax = artWidth + leftK;
          let absHalfDimention =
            Math.sign(halfDimention) === -1 ? Math.abs(halfDimention) : 0;

          if (upDown) {
            if (
              !swap &&
              heightMax <= containerHeight + verticalDifference &&
              heightMax >= artHeight + 1
            ) {
              top = Number(top) - 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
            if (
              swap &&
              heightMax <=
                containerHeight +
                  halfDimention +
                  (heightMax + containerHeight + halfDimention) &&
              heightMax >= artHeight + halfDimention
            ) {
              top = Number(top) - 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
          }
          if (rightDown) {
            if (
              !swap &&
              artWidth - widthMax + widthMax >= artWidth - 5 &&
              widthMax < containerWidth - 3
            ) {
              leftK = Number(leftK) + 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
            if (
              swap &&
              widthMax + Math.abs(halfDimention) >= artWidth - 5 &&
              widthMax < containerWidth - halfDimention - 3
            ) {
              leftK = Number(leftK) + 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
          }

          if (downDown) {
            if (
              swap &&
              heightMax - halfDimention < containerHeight - 3 &&
              heightMax + absHalfDimention >= artHeight - 4
            ) {
              top = Number(top) + 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
            if (
              !swap &&
              heightMax < containerHeight - 3 &&
              heightMax + heightDifference >= artHeight - 4
            ) {
              top = Number(top) + 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
          }
          if (leftDown) {
            if (
              !swap &&
              widthMax >= artWidth + 2 &&
              widthMax < containerWidth + widthDifference
            ) {
              leftK = Number(leftK) - 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
            if (
              swap &&
              widthMax + halfDimention >= artWidth + 2 &&
              widthMax - absHalfDimention <
                containerWidth + Math.abs(halfDimention)
            ) {
              leftK = Number(leftK) - 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
          }

          if (upKey) {
            if (
              !swap &&
              heightMax <= containerHeight + verticalDifference &&
              heightMax >= artHeight + 1
            ) {
              top = Number(top) - 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
            if (
              swap &&
              heightMax <=
                containerHeight +
                  halfDimention +
                  (heightMax + containerHeight + halfDimention) &&
              heightMax >= artHeight + halfDimention
            ) {
              top = Number(top) - 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
          }
          if (rightKey) {
            if (
              !swap &&
              artWidth - widthMax + widthMax >= artWidth - 5 &&
              widthMax < containerWidth - 3
            ) {
              leftK = Number(leftK) + 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
            if (
              swap &&
              widthMax + Math.abs(halfDimention) >= artWidth - 5 &&
              widthMax < containerWidth - halfDimention - 3
            ) {
              leftK = Number(leftK) + 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
          }
          if (downKey) {
            if (
              swap &&
              heightMax - halfDimention < containerHeight - 3 &&
              heightMax + absHalfDimention >= artHeight - 4
            ) {
              top = Number(top) + 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
            if (
              !swap &&
              heightMax < containerHeight - 3 &&
              heightMax + heightDifference >= artHeight - 4
            ) {
              top = Number(top) + 1;
              $(`#${nudgeArtId}`).css('top', top + 'px');
            }
          }
          if (leftKey) {
            if (
              !swap &&
              widthMax >= artWidth + 2 &&
              widthMax < containerWidth + widthDifference
            ) {
              leftK = Number(leftK) - 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
            if (
              swap &&
              widthMax + halfDimention >= artWidth + 2 &&
              widthMax - absHalfDimention <
                containerWidth + Math.abs(halfDimention)
            ) {
              leftK = Number(leftK) - 1;
              $(`#${nudgeArtId}`).css('left', `${leftK}px`);
            }
          }
        }
      }, 20);
      return () => {
        clearInterval(artTimer);
      };
    }
  }, [running]);
  setInterval(function () {
    updatePos();
  }, 100);

  function resizeContainer(event, ui) {
    const containerHeight = Number(
      $(`#${side}-container`).css('height').slice(0, -2),
    );
    const containerWidth = Number(
      $(`#${side}-container`).css('width').slice(0, -2),
    );
    const artworkHeight = ui.helper.outerHeight();
    const artworkWidth = ui.helper.width();
    const object = event.target.getAttribute('id');

    let angle = $(`#${object} .rotation`).eq(0).attr('data-rotation');
    angle = angle
      ? Math.abs(Math.round(angle.replace(/[^\d\.]*/g, '') * (180 / Math.PI)))
      : 0;
    if (angle > 85 && angle < 95) {
      // Arwok width greater than the Artwork height
      if (artworkWidth > artworkHeight) {
        const heightWidthDiff = Math.abs((artworkHeight - artworkWidth) / 2);
        const quaterDifference =
          ui.position.left + 2 >
          containerWidth - artworkHeight - (containerWidth - artworkHeight) / 4
            ? Math.round(heightWidthDiff)
            : 0;

        ui.position.left = Math.max(
          Math.min(
            ui.position.left,
            containerWidth - Math.round(artworkHeight) - quaterDifference,
          ),
          0 - Math.round(heightWidthDiff),
        );

        ui.position.top = Math.max(
          Math.min(ui.position.top, containerHeight - artworkWidth) +
            heightWidthDiff,
          0 + heightWidthDiff,
        );

        return;
      }
      // Arwok width greater than the Artwork height
      if (artworkWidth < artworkHeight) {
        const leftRightPx =
          artworkHeight > 100
            ? (containerWidth - artworkHeight) / 3
            : (containerWidth - artworkHeight) / 9;
        const heightWidthDiff = Math.abs((artworkHeight - artworkWidth) / 2);
        ui.position.left = Math.max(
          Math.min(
            ui.position.left,
            containerWidth - artworkHeight + heightWidthDiff,
          ),
          0 + heightWidthDiff,
        );
        ui.position.top = Math.max(
          Math.min(
            ui.position.top,
            containerHeight - Math.round(artworkWidth) - heightWidthDiff,
          ),
          0 - heightWidthDiff,
        );
        return;
      }
      ui.position.left = Math.max(
        Math.min(ui.position.left, containerWidth - artworkWidth),
        0,
      );
      ui.position.top = Math.max(
        Math.min(ui.position.top, containerHeight - Math.round(artworkHeight)),
        0,
      );

      return;
    } else {
      ui.position.left = Math.max(
        Math.min(ui.position.left, containerWidth - artworkWidth),
        0,
      );
      ui.position.top = Math.max(
        Math.min(ui.position.top, containerHeight - Math.round(artworkHeight)),
        0,
      );
    }
  }
  return (
    <>
      <div id="PolarisPortalsContainer" className="place__artwork_modal">
        <div data-portal-id="modal-Polarisportal8">
          <div>
            <div
              className="Polaris-Modal-Dialog__Container"
              data-polaris-layer="true"
              data-polaris-overlay="true"
            >
              <div>
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="Polarismodal-header8"
                  tabIndex="-1"
                  className="Polaris-Modal-Dialog"
                >
                  <div className="Polaris-Modal-Dialog__Modals">
                    <Spinner
                      accessibilityLabel="Spinner example"
                      size="large"
                    />
                    <div className="Polaris-Modal-Header">
                      <div
                        id="Polarismodal-header8"
                        className="Polaris-Modal-Header__Title"
                      >
                        <h2 className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
                          Place Artwork
                        </h2>
                      </div>
                      <button
                        className="Polaris-Modal-CloseButton"
                        aria-label="Close"
                        onClick={() => {
                          arrow = true;
                          lazy = true;
                          setRunning(!running);
                          side = 'front';
                          productSide = 'front';
                          props.toggleShowModal(false);
                        }}
                      >
                        <span className="Polaris-Icon Polaris-Icon--colorBase Polaris-Icon--applyColor">
                          <svg
                            viewBox="0 0 20 20"
                            className="Polaris-Icon__Svg"
                            focusable="false"
                            aria-hidden="true"
                          >
                            <path d="M11.414 10l6.293-6.293a1 1 0 1 0-1.414-1.414L10 8.586 3.707 2.293a1 1 0 0 0-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 1 0 1.414 1.414L10 11.414l6.293 6.293A.998.998 0 0 0 18 17a.999.999 0 0 0-.293-.707L11.414 10z"></path>
                          </svg>
                        </span>
                      </button>
                    </div>
                    <div
                      className="Polaris-Modal__BodyWrapper"
                      id="customization-element"
                    >
                      <div
                        className="Polaris-Modal__Body Polaris-Scrollable Polaris-Scrollable--vertical"
                        data-polaris-scrollable="true"
                      >
                        <section className="Polaris-Modal-Section">
                          {/* <!--Components--Layout--> */}
                          <div>
                            <div className="Polaris-Layout">
                              <div id="image-layout">
                                <div id="custom_area">
                                  <div id="front-hide">
                                    <div id="front" className="sides">
                                      <div
                                        id="front-canvas"
                                        className="canvas"
                                        style={{
                                          width: '350px',
                                          height: '400px',
                                          backgroundImage: `url("${imageSized}")`,
                                          backgroundSize: '275px 350px',
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center center',
                                        }}
                                      >
                                        <div
                                          id="front-container"
                                          className="container"
                                          data-angle="0"
                                          data-containment="1"
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                  {props.product.images.map((image, index) => {
                                    let sizedImg = image.src;
                                    let sizedImgExt = sizedImg
                                      .split('?')[0]
                                      .split('.')
                                      .pop();
                                    sizedImg = sizedImg.replace(
                                      '.' + sizedImgExt,
                                      '_360x.' + sizedImgExt,
                                    );
                                    return (
                                      <Fragment key={index}>
                                        {image.alt == 'back' ? (
                                          <div id="back-hide">
                                            <div
                                              id="back"
                                              className="sides"
                                              style={{ display: 'none' }}
                                            >
                                              <div
                                                id="back-canvas"
                                                className="canvas"
                                                style={{
                                                  backgroundImage: `url("${sizedImg}")`,
                                                  backgroundSize: '275px 350px',
                                                  backgroundRepeat: 'no-repeat',
                                                  backgroundPosition:
                                                    'center center',
                                                }}
                                              >
                                                <div
                                                  id="back-container"
                                                  className="container"
                                                  data-angle="0"
                                                  data-containment="1"
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : image.alt == 'side' ? (
                                          <div id="sleeve-hide">
                                            <div
                                              id="sleeve"
                                              className="sides"
                                              style={{ display: 'none' }}
                                            >
                                              <div
                                                id="sleeve-canvas"
                                                className="canvas"
                                                style={{
                                                  backgroundImage: `url("${sizedImg}")`,
                                                  backgroundSize: '275px 350px',
                                                  backgroundRepeat: 'no-repeat',
                                                  backgroundPosition:
                                                    'center center',
                                                }}
                                              >
                                                <div
                                                  id="sleeve-container"
                                                  className="container"
                                                  data-angle="0"
                                                  data-containment="1"
                                                  style={{
                                                    width: '125px',
                                                    height: '210px',
                                                    position: 'absolute',
                                                    top: '40%',
                                                    left: '38%',
                                                    margin: '-35px 0 0 -35px',
                                                    display: 'flex',
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null}
                                      </Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="Polaris-Layout__Section Polaris-Layout__Section--secondary mr-10">
                                <div className="Polaris-Card">
                                  {/* <!--Components--Thumbnail--> */}
                                  <Slider {...settings} ref={sliderRef}>
                                    <div
                                      onClick={(event) => {
                                        artSelect &&
                                          artworkHandler(
                                            event.currentTarget.id,
                                            artSelect,
                                          );
                                      }}
                                      id={'art-list-' + artSelect}
                                    >
                                      <span
                                        id={'art-preview-' + artSelect}
                                        className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge art-preview"
                                      >
                                        {assignArtwork ? (
                                          <img
                                            src={
                                              assignArtwork.thumbnail_url
                                                ? assignArtwork.thumbnail_url
                                                : assignArtwork.artwork_url
                                            }
                                            alt={assignArtwork.artwork_name}
                                          />
                                        ) : null}
                                      </span>
                                      <div id="PolarisPortalsContainer"></div>
                                    </div>
                                    {Object.keys(artImages).length > 0
                                      ? Object.keys(artImages).map((key) => {
                                          let url = artImages[
                                            key
                                          ].image_url.replace('url("', '');
                                          url = url.replace('")', '');
                                          let thumbnail_url =
                                            artImages[key].thumbnail_url;

                                          return (
                                            <Fragment key={key}>
                                              <div
                                                onClick={(event) => {
                                                  artworkHandler(
                                                    event.currentTarget.id,
                                                    key,
                                                  );
                                                }}
                                                id={'art-list-' + key}
                                              >
                                                <span
                                                  id={'art-preview-' + key}
                                                  className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge art-preview"
                                                >
                                                  {assignArtwork ? (
                                                    thumbnail_url &&
                                                    thumbnail_url !=
                                                      'undefined' ? (
                                                      <img
                                                        src={thumbnail_url}
                                                        alt={
                                                          artImages[key].name
                                                        }
                                                      />
                                                    ) : (
                                                      <img
                                                        src={url}
                                                        alt={
                                                          artImages[key].name
                                                        }
                                                      />
                                                    )
                                                  ) : null}
                                                </span>
                                                <div id="PolarisPortalsContainer"></div>
                                              </div>
                                            </Fragment>
                                          );
                                        })
                                      : null}
                                  </Slider>
                                </div>
                                {/* <!--Components--Select--> */}

                                <div>
                                  <div className="">
                                    <div className="Polaris-Connected">
                                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                        <Select
                                          id="artwork_colors"
                                          name="artwork_colors"
                                          label="Number of Colors"
                                          options={totalColor}
                                          onChange={(e) => {
                                            let values = e;
                                            setSelectedColor(values);
                                            let timeout = null;
                                            clearTimeout(timeout);
                                            timeout = setTimeout(function () {
                                              $('#' + activeArtwork).attr(
                                                'data-artColor',
                                                values,
                                              );
                                              let type = $(
                                                '#' + activeArtwork,
                                              ).attr('data-type');
                                              setCustomization(
                                                activeArtwork,
                                                type,
                                                side,
                                              );
                                            }, 1000);
                                          }}
                                          value={selectedColor}
                                          onBlur={() => {
                                            clickHandler(true);
                                          }}
                                          onFocus={() => {
                                            clickHandler(false);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div id="PolarisPortalsContainer"></div>
                                </div>
                                <div>
                                  <div className="Polaris-Labelled__LabelWrapper">
                                    <div className="Polaris-Label">
                                      <label
                                        id="PolarisTextField8Label"
                                        htmlFor="PolarisTextField8"
                                        className="Polaris-Label__Text"
                                      >
                                        Nudge
                                      </label>
                                    </div>
                                  </div>
                                  <div className="nudge__list">
                                    <ul className="Polaris-List">
                                      <li className="Polaris-List__Item">
                                        <div>
                                          <button
                                            className="Polaris-Button"
                                            type="button"
                                            id="buttonDown"
                                          >
                                            <span className="Polaris-Button__Content">
                                              <img
                                                src={IconDown}
                                                alt="Down button"
                                              />
                                            </span>
                                          </button>
                                          <div id="PolarisPortalsContainer"></div>
                                        </div>
                                      </li>
                                      <li className="Polaris-List__Item">
                                        <div>
                                          <button
                                            className="Polaris-Button"
                                            type="button"
                                            id="buttonUp"
                                          >
                                            <span className="Polaris-Button__Content">
                                              <img
                                                src={IconUp}
                                                alt="Up button"
                                              />
                                            </span>
                                          </button>
                                          <div id="PolarisPortalsContainer"></div>
                                        </div>
                                      </li>
                                      <li className="Polaris-List__Item">
                                        <div>
                                          <button
                                            className="Polaris-Button"
                                            type="button"
                                            id="buttonLeft"
                                          >
                                            <span className="Polaris-Button__Content">
                                              <img
                                                src={IconLeft}
                                                alt="Left button"
                                              />
                                            </span>
                                          </button>
                                          <div id="PolarisPortalsContainer"></div>
                                        </div>
                                      </li>
                                      <li className="Polaris-List__Item">
                                        <div>
                                          <button
                                            className="Polaris-Button"
                                            type="button"
                                            id="buttonRight"
                                          >
                                            <span className="Polaris-Button__Content">
                                              <img
                                                src={IconRight}
                                                alt="Right button"
                                              />
                                            </span>
                                          </button>
                                          <div id="PolarisPortalsContainer"></div>
                                        </div>
                                      </li>
                                    </ul>
                                    <div id="PolarisPortalsContainer"></div>
                                  </div>
                                </div>
                                {/* <!--Components--TextField--> */}
                                <div>
                                  <div>
                                    <div className="Polaris-Labelled__LabelWrapper">
                                      <div className="Polaris-Label">
                                        <label
                                          id="PolarisTextField8Label"
                                          htmlFor="PolarisTextField8"
                                          className="Polaris-Label__Text"
                                        >
                                          Add Artwork Instructions
                                        </label>
                                      </div>
                                    </div>
                                    <div className="Polaris-Connected">
                                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                        <div className="Polaris-TextField Polaris-TextField--hasValue Polaris-TextField--multiline">
                                          <textarea
                                            id="PolarisTextField8"
                                            className="Polaris-TextField__Input instruction-text"
                                            aria-labelledby="PolarisTextField8Label"
                                            aria-invalid="false"
                                            aria-multiline="true"
                                            style={{ height: '106px' }}
                                            onKeyUp={(e) => {
                                              let value = e.target.value;
                                              let timeout = null;
                                              clearTimeout(timeout);
                                              timeout = setTimeout(function () {
                                                setArtworkInstruction(value);
                                                $('#' + activeArtwork).attr(
                                                  'data-instruction',
                                                  value,
                                                );
                                                let type = $(
                                                  '#' + activeArtwork,
                                                ).attr('data-type');
                                                setCustomization(
                                                  activeArtwork,
                                                  type,
                                                  side,
                                                );
                                              }, 1000);
                                            }}
                                            ref={instructionRef}
                                            onClick={instructionClickHandle}
                                            onBlur={instructionClickHandle}
                                            defaultValue={artworkInstruction}
                                          ></textarea>
                                          <div className="Polaris-TextField__Backdrop"></div>
                                          <div
                                            aria-hidden="true"
                                            className="Polaris-TextField__Resizer"
                                          >
                                            <div className="Polaris-TextField__DummyInput"></div>
                                            <div className="Polaris-TextField__DummyInput">
                                              <br />
                                              <br />
                                              <br />
                                              <br />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div id="PolarisPortalsContainer"></div>
                                </div>
                                <div>
                                  <div className="Polaris-Labelled__LabelWrapper">
                                    <div className="Polaris-Label">
                                      <label
                                        id="PolarisTextField8Label"
                                        htmlFor="PolarisTextField8"
                                        className="Polaris-Label__Text"
                                      >
                                        Choose Side
                                      </label>
                                    </div>
                                  </div>
                                  <div className="Polaris-ButtonGroup">
                                    <div className="Polaris-ButtonGroup__Item">
                                      <Button
                                        className="Polaris-Button"
                                        type="button"
                                        id="front_button"
                                        pressed={isFrontButtonActive}
                                        onClick={() => {
                                          handleFrontButtonClick();
                                          deleteArtElement(
                                            'front',
                                            latestArtCount,
                                          );

                                          $('.sides').css('display', 'none');
                                          $('#front').css('display', 'block');
                                          productSide = 'front';
                                        }}
                                      >
                                        <span className="Polaris-Button__Content">
                                          <span className="Polaris-Button__Text">
                                            Front
                                          </span>
                                        </span>
                                      </Button>
                                    </div>
                                    <div className="Polaris-ButtonGroup__Item">
                                      <Button
                                        className="Polaris-Button"
                                        type="button"
                                        id="back_button"
                                        pressed={isBackButtonActive}
                                        onClick={() => {
                                          handleBackButtonClick();
                                          deleteArtElement(
                                            'back',
                                            latestArtCount,
                                          );
                                          $('.sides').css('display', 'none');
                                          $('#back').css('display', 'block');
                                          productSide = 'back';
                                        }}
                                      >
                                        <span className="Polaris-Button__Content">
                                          <span className="Polaris-Button__Text">
                                            Back
                                          </span>
                                        </span>
                                      </Button>
                                    </div>
                                    <div className="Polaris-ButtonGroup__Item">
                                      <Button
                                        className="Polaris-Button"
                                        type="button"
                                        id="sleeve_button"
                                        pressed={isSleeveButtonActive}
                                        onClick={() => {
                                          handleSleeveButtonClick();
                                          deleteArtElement(
                                            'sleeve',
                                            latestArtCount,
                                          );
                                          $('.sides').css('display', 'none');
                                          $('#sleeve').css('display', 'block');
                                          productSide = 'sleeve';
                                        }}
                                      >
                                        <span className="Polaris-Button__Content">
                                          <span className="Polaris-Button__Text">
                                            Sleeve
                                          </span>
                                        </span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div id="PolarisPortalsContainer"></div>
                          </div>
                        </section>
                      </div>
                    </div>
                    <div className="Polaris-Modal-Footer">
                      <div className="Polaris-Modal-Footer__FooterContents">
                        <div className="Polaris-Stack Polaris-Stack--alignmentCenter">
                          <div className="Polaris-Stack__Item Polaris-Stack__Item--fill"></div>
                          <div className="Polaris-Stack__Item">
                            <div className="Polaris-ButtonGroup">
                              <div
                                className="Polaris-ButtonGroup__Item"
                                style={{ marginTop: '-20px' }}
                              >
                                <button
                                  className="Polaris-Button"
                                  type="button"
                                  onClick={() => {
                                    arrow = true;
                                    lazy = true;
                                    swap = false;
                                    setRunning(!running);
                                    side = 'front';
                                    productSide = 'front';
                                    setArtImages({});
                                    props.toggleShowModal(false);
                                  }}
                                >
                                  <span className="Polaris-Button__Content">
                                    <span className="Polaris-Button__Text">
                                      Cancel
                                    </span>
                                  </span>
                                </button>
                              </div>
                              <div
                                className="Polaris-ButtonGroup__Item"
                                style={{ marginTop: '-20px' }}
                              >
                                <button
                                  className="Polaris-Button Polaris-Button--primary"
                                  type="button"
                                  onClick={() =>
                                    setTimeout(() => {
                                      placeArt(), setRunning(!running);
                                    }, 1000)
                                  }
                                >
                                  <span className="Polaris-Button__Content">
                                    <span className="Polaris-Button__Text">
                                      Place
                                    </span>
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="Polaris-Backdrop"></div>
        </div>
      </div>
    </>
  );
};

export default PlaceArtwork;
