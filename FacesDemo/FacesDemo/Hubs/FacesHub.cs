using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace FacesDemo.Hubs
{
    public class FacesHub : Hub
    {
        public void Subscribe(string storeName)
        {
            Groups.Add(Context.ConnectionId, storeName);
        }

        public void Unsubscribe(string storeName)
        {
            Groups.Remove(Context.ConnectionId, storeName);
        }
    }
}