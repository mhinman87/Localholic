import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Loading, LoadingController, Events } from 'ionic-angular';
import { FoodTruckMarker } from '../../models/foodtruck-marker.model';
import { DatabaseProvider } from '../../providers/database/database';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

 

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnDestroy {

  map: google.maps.Map;
  markers = [];
  foodtruckSubscription: any;
  loader: Loading;
  userPositionMarker: google.maps.Marker;
  
  

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private platform: Platform,
              private dbProvider: DatabaseProvider,
              private geolocation: Geolocation,
              private loadingCrtl: LoadingController,
              private events: Events ) {
  }
 
  //Initialize Map on page load
  async ionViewDidLoad() {
    this.showLoading();
    await this.geolocation.getCurrentPosition({
      timeout: 5000
    }).then((position)=>{

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.platform.ready().then(() => {
        this.initializeMap(latLng, 14);
        this.userPositionMarker.setPosition(latLng);
        
      })
      
    },(err) => {
      this.platform.ready().then(()=>{
        let LatLng = new google.maps.LatLng(37.6872, -97.3301 );
        this.initializeMap(LatLng, 12);
        this.geolocation.getCurrentPosition().then((position)=>{
          let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          this.userPositionMarker.setPosition(latLng);
        })
      })
      console.log(err);
    });


    //subscribe to updated user locations from details pages
    this.events.subscribe('user-location', posData => {
      let LatLng = new google.maps.LatLng(posData[0], posData[1] );
      this.userPositionMarker.setPosition(LatLng);
      console.log('user position updated');
    });

    this.loader.dismiss();
    
    
  }

  watchUserPosition(){
    const subscription = this.geolocation.watchPosition(
      {
        enableHighAccuracy: true
      }
    )
    .subscribe((position) => {
      var userCoordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      
      if (position.coords.accuracy < 50){
        this.userPositionMarker.setPosition(userCoordinates);
        
        if (position.coords.accuracy < 25){
          this.userPositionMarker.setPosition(userCoordinates);
          subscription.unsubscribe();
          console.log("clearWatch... unsubscribed from user position");
        }
        console.log(userCoordinates)
      }
});
  }

  showLoading(){
    this.loader = this.loadingCrtl.create({
      content: `<img src="assets/imgs/loading.gif" />`,
      showBackdrop: false,
      spinner: 'hide'
    })
    this.loader.present();
  }

  //initialize map, subscribe to foodtrucks, place markers, add click event to markers
  initializeMap(latLng: google.maps.LatLng, zoomLevel){
    

    var styledMapType = new google.maps.StyledMapType(
      [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#212121"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#212121"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#c20051"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.country",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#181818"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#1b1b1b"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#373737"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#8a8a8a"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#373737"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "stylers": [
            {
              "weight": 1.5
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#3c3c3c"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#0082ca"
            },
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#4e4e4e"
            }
          ]
        },
        {
          "featureType": "road.highway.controlled_access",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#0082ca"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#000000"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3d3d3d"
            }
          ]
        }
      ]
        
        ,
      {name: 'Styled Map'});

    this.map = new
    google.maps.Map(document.getElementById('map_canvas'), {
      zoom: zoomLevel,
      center: latLng,
      mapTypeControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
      fullscreenControl: false,
      clickableIcons: false,
      minZoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                'styled_map']
      }      
    })

    this.map.mapTypes.set('styled_map', styledMapType);
    this.map.setMapTypeId('styled_map');

    

   this.foodtruckSubscription = this.dbProvider.getFoodtrucks().subscribe((OBtrucks)=>{
      console.log(OBtrucks);
      this.setMapOnAll(null);
    
    for (let truck of OBtrucks){
      let truckMarker: google.maps.Marker = new FoodTruckMarker(truck) 
      truckMarker.setOptions({
        position: new google.maps.LatLng(truck.lat, truck.long),
        map: this.map,
        icon: {
          url: `assets/imgs/${truck.image}.gif`,
          scaledSize: new google.maps.Size(42, 42),
        },
        animation: google.maps.Animation.DROP
      });

      google.maps.event.addListener(truckMarker, 'click', ()=>{
        let selectedMarker: any = truckMarker;
        this.navCtrl.push('DetailsPage', {
          truckData: selectedMarker.truckData
          })
        this.map.setCenter(truckMarker.getPosition());
      })

      this.markers.push(truckMarker);

    }

   

    console.log(this.markers);

  })

  this.userPositionMarker = new google.maps.Marker;
  this.userPositionMarker.setMap(this.map);

}

setMapOnAll(map) {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(map);
  }
}

ngOnDestroy(){
  this.foodtruckSubscription.unsubscribe();
  this.events.unsubscribe('user-location', ()=>{
    console.log('Unsubscribed from user location updates');
  });
}

ionViewDidLeave(){
  this.foodtruckSubscription.unsubscribe();
}

 
  
  
}
