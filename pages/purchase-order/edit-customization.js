import React, {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useRef,
} from 'react';
import { Button } from '@shopify/polaris';
import { useRouter } from 'next/router';
import { Spinner, Select } from '@shopify/polaris';
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
let artImageArray = {};
let frontObject = [];
let backObject = [];
let sleeveObject = [];
let nudgeArtId = null;
let swap = false;
const EditCustomization = (props) => {
  const router = useRouter();
  const product = props.product;
  const assignArtwork = props.artwork;
  const orderType = props.type;
  const [loading, setLoading] = useState(true);
  const [productSide, setProductSide] = useState('front');
  const [artworkInstruction, setArtworkInstruction] = useState('');
  const [activeArtwork, setActiveArtwork] = useState('');
  const [artImages, setArtImages] = useState({});
  const [isFrontButtonActive, setIsFrontButtonActive] = useState(true);
  const [isBackButtonActive, setIsBackButtonActive] = useState(false);
  const [isSleeveButtonActive, setIsSleeveButtonActive] = useState(false);
  const [isPlaceButton, setIsPlaceButton] = useState(false);
  const [selectedColor, setSelectedColor] = useState('1');
  const [totalColor, setTotalColor] = useState([]);
  const [imageSized, setImageSized] = useState('');
  const sliderRef = useRef();
  const isCancelled = useRef(false);
  const instructionRef = useRef(null);
  const handleOnClick = (index) => {
    sliderRef.current.slickGoTo(index);
  };
  const [running, setRunning] = useState(true);
  let settings = {
    dots: false,
    infinite: false,
    lazyLoad: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    swipe: false,
    waitForAnimate: false,
  };
  const handleArtworkSelect = (eventId, artWorkSelected) => {
    if (eventId && $('.edit__artwork_modal').length > 0) {
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
      $('.art-preview').css('border', '0.1rem solid var(--p-divider)');
      $('#art-preview-' + artWorkSelected).css(
        'border',
        '3px solid rgb(69, 143, 255)',
      );
      $('.resizable').removeClass('art-preview-select');
      $('#' + artWorkSelected).addClass('art-preview-select');
      setActiveArtwork(artWorkSelected);
      nudgeArtId = artWorkSelected;
      let instruction = $('#' + artWorkSelected).attr('data-instruction');
      $('.instruction-text').val(instruction);
      let artSelectColor = $('#' + artWorkSelected).attr('data-artColor');
      let artTotalColor = $('#' + artWorkSelected).attr('data-totalArtColor');
      setSelectedColor(artSelectColor);
      artWorkSelected;
      let options = [];
      for (let i = 1; i <= artTotalColor; ++i) {
        options.push({
          label: '' + i + '',
          value: '' + i + '',
        });
      }
      setTotalColor(options);
      let sizedImg = product.image.src;
      let sizedImgExt = sizedImg.split('?')[0].split('.').pop();
      sizedImg = sizedImg.replace('.' + sizedImgExt, '_360x.' + sizedImgExt);
      setImageSized(sizedImg);
    }
  };
  const handleFrontButtonClick = useCallback(() => {
    setIsFrontButtonActive(true);
    setIsBackButtonActive(false);
    setIsSleeveButtonActive(false);
  }, [isFrontButtonActive]);
  const handleBackButtonClick = useCallback(() => {
    setIsFrontButtonActive(false);
    setIsBackButtonActive(true);
    setIsSleeveButtonActive(false);
  }, [isBackButtonActive]);
  const handleSleeveButtonClick = useCallback(() => {
    setIsFrontButtonActive(false);
    setIsBackButtonActive(false);
    setIsSleeveButtonActive(true);
  }, [isSleeveButtonActive]);

  let artCount = 0;
  let previewResult = [];
  let getCanvas = null;
  let firstArtworkKey = null;

  let leftDown, rightDown, upDown, downDown, leftKey, upKey, rightKey, downKey;
  let left = 37,
    up = 38,
    right = 39,
    down = 40;

  let holdingLeft = false;
  let holdingRight = false;
  let holdingUp = false;
  let holdingDown = false;

  $('#edit-customization-element').css('opacity', 'none');
  $('.slick-slider').css('width', '100%');

  useEffect(() => {
    isCancelled.current = false;
    $('#front-hide').removeClass('side-hide');
    $('#back-hide').removeClass('side-hide');
    $('#sleeve-hide').removeClass('side-hide');
    side = productSide ? productSide : side;
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
        $('.Polaris-Spinner--sizeLarge').css({
          display: 'none',
          position: 'fixed',
          width: '100%',
          top: '220px',
          'text-align': 'center',
        });
        await getCustomization();
        customizationObject();
        if (props && props.selectedSide != 'front') {
          let selectSide = props.selectedSide;
          $('#' + selectSide + '_button').trigger('click');
          let [firstArtKey] = Object.keys(
            customizationStorage[selectSide].art_image_array,
          );
          $('#art-preview-' + firstArtKey).trigger('click');
          $('#art-preview-' + firstArtKey).css(
            'border',
            '3px solid rgb(69, 143, 255)',
          );
          setActiveArtwork(firstArtKey);
        }
      } catch (e) {
        console.log(e);
      }
    })();
    return () => {
      isCancelled.current = true;
    };
  }, [props.uniqueKey]);

  useEffect(() => {
    nudgeArtId = null;
    setSelectedColor(1);
    side = productSide ? productSide : side;
    if (
      customizationStorage[side] != undefined &&
      Object.keys(customizationStorage[side].art_image_array).length > 0
    ) {
      let currentArtwork = Object.keys(
        customizationStorage[productSide].art_image_array,
      )[0];
      let currentArtValue = Object.values(
        customizationStorage[productSide].art_image_array,
      )[0];
      setSelectedColor(currentArtValue.color);
      setIsPlaceButton(true);
      artImageArray = customizationStorage[side].art_image_array;
      setArtImages(artImageArray);
      [firstArtworkKey] = Object.keys(
        customizationStorage[productSide].art_image_array,
      );
      $('#art-preview-' + firstArtworkKey).css(
        'border',
        '3px solid rgb(69, 143, 255)',
      );
      setActiveArtwork(firstArtworkKey);
      $('#' + firstArtworkKey).addClass('art-preview-select');
      setTimeout(function () {
        document.getElementById(`art-preview-${firstArtworkKey}`).click();
      }, 100);
      let artSelectColor = $('#' + firstArtworkKey).attr('data-artColor');
      let artTotalColor = $('#' + firstArtworkKey).attr('data-totalArtColor');
      setSelectedColor(artSelectColor);
      let options = [];
      for (let i = 1; i <= artTotalColor; ++i) {
        options.push({ label: '' + i + '', value: '' + i + '' });
      }
      setTotalColor(options);
    } else {
      $('#PolarisTextField8').val('');
      $('#PolarisTextField8').attr('editable', false);
      setTotalColor([{ label: '', value: '' }]);
      setIsPlaceButton(false);
      setArtImages({});
    }

    handleOnClick(0);
  }, [productSide]);

  async function getCustomization() {
    $('#front-container').html('');
    $('#back-container').html('');
    $('#sleeve-container').html('');
    let customizationInfoData = localStorage.getItem('customizationInfo');
    if (customizationInfoData) {
      customizationInfoData = JSON.parse(customizationInfoData);
      let customizationElements = null;
      customizationElements = customizationInfoData.customization_elements;
      if (productSide == '') {
        if ('front' in customizationElements) {
          side = 'front';
        } else if ('back' in customizationElements) {
          side = 'back';
        } else if ('sleeve' in customizationElements) {
          side = 'sleeve';
        }
      }
      if ('front' in customizationElements) {
        side = 'front';
      } else if ('back' in customizationElements) {
        side = 'back';
      } else if ('sleeve' in customizationElements) {
        side = 'sleeve';
      }
      $('#' + side + '_button').trigger('click');
      $('#' + side + '-div').addClass('selected');
      artCount = 0;
      $.each(customizationElements, function (key, artElements) {
        if (artElements.art_image_status) {
          let sideContainer = artElements.containerCustomization;
          if (sideContainer && sideContainer != undefined) {
            $('#' + key + '-container').css(sideContainer);
          }
          $('#' + key + '-canvas').css(
            'background-image',
            artElements.product_image,
          );
          let arts = artElements.art_image_array;
          if (arts) {
            $.each(arts, function (index, art_image_data) {
              artCount = artCount + 1;
              let artHtml =
                "<div id='" +
                index +
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
                "background-size: 100% 100%;background-repeat: no-repeat;background-position: center center;position: absolute;'>" +
                "<div class='resizers'><span class='rotation' data-rotation=''></span>" +
                "<div id='top-left-" +
                index +
                "' class='top-left coordinal-elements' style='background-image: url(" +
                TrashImage +
                ');' +
                "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
                "<div id='top-right-" +
                index +
                "' class='resizer top-right coordinal-elements' style='background-image: url(" +
                ExpandArrow +
                ');' +
                "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
                "<div id='bottom-left-" +
                index +
                "' class='bottom-left coordinal-elements' style='background-image: url(" +
                RotationImage +
                ');' +
                "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
                "<div id='bottom-right-" +
                index +
                "'class='resizer bottom-right coordinal-elements' style='background-image: url(" +
                ResizeArrow +
                ');' +
                "background-size:100% 100%;background-repeat: no-repeat;background-position: center center;'></div>" +
                '</div></div>';
              $('#' + key + '-container').append(artHtml);
              $('#' + index).css({
                width: art_image_data.image_width,
                height: art_image_data.image_height,
                left: art_image_data.image_position_x,
                top: art_image_data.image_position_y,
                transform: art_image_data.image_rotation,
              });
              $('#' + index + ' .rotation').attr(
                'data-rotation',
                art_image_data.image_rotation,
              );
              setCustomization(index, 'image', key);
            });
          }
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
          setContainerCustomization(productSide);
        },
      });

      /* Function to resize an element */
      $('#draggableNew, .resizableNew').resizable({
        containment: 'parent',
        handles: 'e, s, n, w, ne, se',
        aspectRatio: false,
        resize: function (event, ui) {
          setContainerCustomization(productSide);
        },
      });

      /* Function to set instructions to an element */
      $(document).on('click', '.resizable', function () {
        if ($('.edit__artwork_modal').length > 0) {
          $('.resizable').removeClass('art-preview-select');
          let element = $(this).attr('id');
          $('#' + element).addClass('art-preview-select');
          $('.art-preview').css('border', '0.1rem solid var(--p-divider)');
          $('#art-preview-' + element).css(
            'border',
            '3px solid rgb(69, 143, 255)',
          );
          if (isCancelled.current) {
            return false;
          }
          setActiveArtwork(element);
          nudgeArtId = element;
          let instruction = $('#' + element).attr('data-instruction');
          $('.instruction-text').val(instruction);
        }
      });

      /* Delete Art decleration*/
      let deleteElement = document.querySelector('.top-left');
      if (deleteElement) {
        deleteElement.style.cursor = 'pointer';
      }

      /* Rotation */
      function getCenter(element) {
        const { left, top, width, height, right, bottom, x, y } =
          element.getBoundingClientRect();
        return {
          x: left + width / 2,
          y: top + height / 2,
          h: height,
          w: width,
          l: left,
          t: top,
        };
      }

      let angle;
      let art;
      let flag;

      $('body').on('click', '.bottom-left', async function () {
        flag = 1;
        let element = $(this).attr('id');
        let artID = element.split('-').pop();
        art = document.querySelector('#' + element).closest('.resizable');
        const art_center = getCenter(art);

        addEventListener('mousemove', ({ clientX, clientY }) => {
          if (flag == 1) {
            angle = Math.atan2(clientY - art_center.y, clientX - art_center.x);
            if (
              Math.abs(Math.round(angle * (180 / Math.PI))) > 45 &&
              Math.abs(Math.round(angle * (180 / Math.PI))) < 135
            ) {
              swap = true;
            } else {
              swap = false;
            }
            art.style.transform = `rotate(${angle}rad)`;
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
      $(document).on('click', '.top-left', async function () {
        if ($('.edit__artwork_modal').length > 0) {
          let obj = $(this).closest('.resizable');
          let element = $(obj).attr('id');
          if (side == 'front') {
            delete frontObject[element];
          }
          if (side == 'back') {
            delete backObject[element];
          }
          if (side == 'sleeve') {
            delete sleeveObject[element];
          }
          delete customizationStorage[side]['art_image_array'][element];
          await customizationObject();
          $(this).closest('.resizable').remove();
        }
      });
    }
  }

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
  /* function to set the customization object on art instruction updation of an art */
  function setCustomizationComment(element, value) {
    document.getElementById(element).setAttribute('data-instruction', value);
  }
  function customizationObject() {
    let artImagesObject = {};
    if (
      customizationStorage[side] != undefined &&
      Object.keys(customizationStorage[side].art_image_array).length > 0
    ) {
      artImagesObject = customizationStorage[side].art_image_array;
      if (isCancelled.current) {
        return false;
      }
      setArtImages(artImagesObject);
      let [firstKey] = Object.keys(artImagesObject);
      if (
        artImagesObject.firstKey != undefined &&
        artImagesObject.firstKey.instruction
      ) {
        $('#PolarisTextField8').val(artImagesObject.firstKey.instruction);
        setArtworkInstruction(artImagesObject.firstKey.instruction);
      }
      setTimeout(function () {
        if (document.getElementById(`${firstKey}`)) {
          setActiveArtwork(firstKey);
          document.getElementById(`${firstKey}`).click();
        }
      }, 200);
    } else {
      artImagesObject = {};
      setArtImages(artImagesObject);
    }
  }
  const placeArt = async () => {
    $('.resizable').removeClass('art-preview-select');
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
    $('.coordinal-elements').css({
      'background-image': 'none',
      'background-size': 'none',
      'background-repeat': 'none',
      'background-position': 'none',
    });
    $('#edit_custom_area').addClass('custom-area');
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
    const previewSleeve = preview(sleeveContainer);

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
    setTimeout(redirect, 300);
  };

  /* Generating the preview */
  async function preview(container, index) {
    const canvas = await html2canvas(container, {
      allowTaint: true,
      useCORS: true,
      logging: false,
    });
    getCanvas = canvas;
    let image = new Image();
    let data = canvas.toDataURL('image/png');
    image.crossOrigin = 'anonymous';
    image.src = data;
    return data;
  }

  function redirect() {
    frontObject = [];
    backObject = [];
    sleeveObject = [];
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
    document.getElementsByClassName('edit__artwork_modal')[0].style.display =
      'none';
    $('.Polaris-Modal-Dialog__Container').css('z-index', '519');
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
      let type = $(nudgeArtId).data('type');
      setCustomization(nudgeArtId, 'image', side);
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

  const instructionClickHandle = () => {
    if (document.activeElement === instructionRef.current) {
      setRunning(false);
      return;
    }
    setRunning(true);
  };

  const clickHandler = (status) => {
    if (!status) {
      setRunning(false);
      return;
    }
    setRunning(true);
  };

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
      <div id="PolarisPortalsContainer" className="edit__artwork_modal">
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
                          setRunning(!running);
                          frontObject = [];
                          backObject = [];
                          sleeveObject = [];
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
                      id="edit-customization-element"
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
                                <div id="edit_custom_area">
                                  <div id="front-hide">
                                    <div
                                      id="front"
                                      className="sides front-side"
                                    >
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
                                          style={{ overflow: 'hidden' }}
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
                                              className="sides back-side"
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
                                                  style={{
                                                    zIndex: '50',
                                                    overflow: 'hidden',
                                                  }}
                                                ></div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : image.alt == 'side' ? (
                                          <div id="sleeve-hide">
                                            <div
                                              id="sleeve"
                                              className="sides sleeve-side"
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
                                                    overflow: 'hidden',
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
                                    {Object.keys(artImages).length > 0
                                      ? Object.keys(artImages).map((key) => {
                                          let url = artImages[
                                            key
                                          ].image_url.replace('url("', '');
                                          url = url.replace('")', '');
                                          let thumbnail_url =
                                            artImages[key].thumbnail_url;
                                          return (
                                            <Fragment key={'slider' + key}>
                                              <div
                                                onClick={(event) => {
                                                  handleArtworkSelect(
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
                                              <div>
                                                {/* <!--Components--Tag--> */}
                                                <div>
                                                  <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                {/* <!--Components--DisplayText--> */}
                                                <div>
                                                  <p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
                                                    {assignArtwork.artwork_name}
                                                  </p>
                                                  <div id="PolarisPortalsContainer"></div>
                                                </div>
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
                                {/* <!--Components--Select--> */}

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
                                                let type = $(
                                                  '#' + activeArtwork,
                                                ).attr('data-type');
                                                setCustomizationComment(
                                                  activeArtwork,
                                                  value,
                                                );
                                              }, 1000);
                                            }}
                                            defaultValue={artworkInstruction}
                                            ref={instructionRef}
                                            onClick={instructionClickHandle}
                                            onBlur={instructionClickHandle}
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
                                        pressed={isFrontButtonActive}
                                        id="front_button"
                                        onClick={() => {
                                          handleFrontButtonClick();
                                          $('.sides').css('display', 'none');
                                          $('.front-side').css(
                                            'display',
                                            'block',
                                          );
                                          setProductSide('front');
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
                                        pressed={isBackButtonActive}
                                        id="back_button"
                                        onClick={() => {
                                          handleBackButtonClick();
                                          $('.sides').css('display', 'none');
                                          $('.back-side').css(
                                            'display',
                                            'block',
                                          );
                                          setProductSide('back');
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
                                        pressed={isSleeveButtonActive}
                                        id="sleeve_button"
                                        onClick={() => {
                                          handleSleeveButtonClick();
                                          $('.sides').css('display', 'none');
                                          $('.sleeve-side').css(
                                            'display',
                                            'block',
                                          );
                                          setProductSide('sleeve');
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
                              <div className="Polaris-ButtonGroup__Item">
                                <button
                                  className="Polaris-Button"
                                  type="button"
                                  onClick={() => {
                                    swap = false;
                                    setRunning(!running);
                                    frontObject = [];
                                    backObject = [];
                                    sleeveObject = [];
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
                              {isPlaceButton ? (
                                <div className="Polaris-ButtonGroup__Item">
                                  <button
                                    id="place_button"
                                    className="Polaris-Button Polaris-Button--primary place_button"
                                    type="button"
                                    onClick={() => {
                                      placeArt(), setRunning(!running);
                                    }}
                                  >
                                    <span className="Polaris-Button__Content">
                                      <span className="Polaris-Button__Text">
                                        Place
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                <div className="Polaris-ButtonGroup__Item">
                                  <button
                                    id="place_button"
                                    className="Polaris-Button Polaris-Button--primary place_button"
                                    type="button"
                                    style={{ backgroundColor: '#756d71' }}
                                  >
                                    <span className="Polaris-Button__Content">
                                      <span className="Polaris-Button__Text">
                                        Place
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              )}
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

export default EditCustomization;
